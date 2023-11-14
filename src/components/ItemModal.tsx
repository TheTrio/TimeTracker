import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import Modal from 'react-responsive-modal'
import { firebaseDb } from '../firebase/firebase'
import { ModalConfig, TimeFormat, TimeTrackedItem } from '../types'
import { toast } from 'react-toastify'
import {
  DEFAULT_TIME_FORMAT,
  TIME_FRAMES,
  convertDateToUTC,
  isCountdown,
  localeDateString,
  sortItems,
} from '../utils/utils'
import { TimeFormatInput } from './TimeFormatInput'

type ItemModalProps = {
  modal: ModalConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setModal: (...args: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setItems: (...args: any) => void
  userId: string
  deleteItem: (arg: TimeTrackedItem) => Promise<void>
}

const addDocument = async (
  userId: string,
  payload: Omit<TimeTrackedItem, 'id'>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setItems: (...args: any) => void
) => {
  const doc = await addDoc(collection(firebaseDb, 'users', userId, 'times'), {
    ...payload,
  })

  setItems((items: TimeTrackedItem[]) =>
    sortItems([
      ...items,
      {
        ...payload,
        id: doc.id,
      },
    ])
  )
}

const updateDocument = async (
  userId: string,
  payload: Partial<TimeTrackedItem>,
  documentId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setItems: (...args: any) => void
) => {
  await updateDoc(doc(firebaseDb, 'users', userId!, 'times', documentId), {
    ...payload,
  })
  setItems((items: TimeTrackedItem[]) =>
    sortItems(
      items.map((item) => {
        if (item.id === documentId) {
          return {
            ...item,
            ...payload,
          }
        }
        return item
      })
    )
  )
}

const ItemModal = (props: ItemModalProps) => {
  const { modal, setModal, setItems, userId, deleteItem } = props
  let date: Date = new Date(),
    name: string = '',
    defaultTimeFormats: TimeFormat = DEFAULT_TIME_FORMAT
  if (modal.type === 'edit') {
    date = modal.item.startsAt
    name = modal.item.name
    defaultTimeFormats = modal.item.format ?? defaultTimeFormats
  }
  return (
    <Modal
      open={modal.show}
      onClose={() =>
        setModal((modal: ModalConfig) => ({
          ...modal,
          show: false,
        }))
      }
      center
    >
      <h2 className="mb-4">Add an Item to track</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const name = (e.currentTarget.name as any).value as string
          const startsAt = convertDateToUTC(
            new Date(e.currentTarget.startsAt.value)
          )

          const timeFormat = {
            years: e.currentTarget.years.checked,
            months: e.currentTarget.months.checked,
            days: e.currentTarget.days.checked,
            hours: e.currentTarget.hours.checked,
            minutes: e.currentTarget.minutes.checked,
            seconds: e.currentTarget.seconds.checked,
          }
          if (modal.type === 'add') {
            await toast.promise(
              addDocument(
                userId!,
                {
                  name,
                  startsAt,
                  countdown: isCountdown(startsAt),
                  format: timeFormat,
                },
                setItems
              ),
              {
                pending: 'Adding item',
                success: 'Item added!',
                error: 'Error while adding item. Please try again later',
              },
              {
                autoClose: 2000,
              }
            )
          } else {
            await toast.promise(
              updateDocument(
                userId!,
                {
                  name,
                  startsAt,
                  countdown: isCountdown(startsAt),
                  format: timeFormat,
                },
                modal.item.id,
                setItems
              ),
              {
                pending: 'Updating item',
                success: 'Item updated!',
                error: 'Error while updating item. Please try again later',
              },
              {
                autoClose: 2000,
              }
            )
          }
          setModal((modal: ModalConfig) => ({
            ...modal,
            show: false,
          }))
        }}
        className="flex flex-col gap-4"
      >
        <input
          type="text"
          name="name"
          placeholder="Name goes here"
          defaultValue={name}
          className="border-gray-400 border-2 rounded px-2"
        />
        <input
          type="date"
          name="startsAt"
          defaultValue={localeDateString(date)}
        />
        <div
          className="grid justify-center gap-2"
          style={{
            gridTemplateColumns: 'min-content min-content',
          }}
        >
          {TIME_FRAMES.map((key) => (
            <TimeFormatInput
              defaults={defaultTimeFormats}
              type={key as keyof TimeFormat}
              key={key}
            />
          ))}
        </div>
        <button
          type="submit"
          className="text-black border-black border-2 rounded-md active:scale-90 hover:bg-slate-100 transition"
        >
          {modal.type === 'add' ? 'Add' : 'Update'}
        </button>
        {modal.type === 'edit' && (
          <button
            type="button"
            className="text-white border-2 rounded-md bg-red-500 border-red-500 hover:bg-red-700 transition active:scale-90"
            onClick={() => {
              toast.promise(
                deleteItem(modal.item),
                {
                  pending: 'Deleting item',
                  success: 'Item deleted!',
                  error: 'Error while deleting item. Please try again later',
                },
                {
                  autoClose: 2000,
                }
              )
            }}
          >
            Delete
          </button>
        )}
      </form>
    </Modal>
  )
}

export default ItemModal
