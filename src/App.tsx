import { useEffect, useState } from 'react'
import 'react-responsive-modal/styles.css'
import { Item } from './components/Item'
import { ModalConfig, TimeTrackedItem } from './types'
import { firebaseAuth } from './firebase/firebase'
import { useGoogleAuth } from './utils/useGoogleAuth'
import { InfinitySpin } from 'react-loader-spinner'
import { getDocs, deleteDoc } from 'firebase/firestore'
import ItemModal from './components/ItemModal'
import {
  getItemsFromFireStore,
  itemDocument,
  sortItems,
  timesCollection,
} from './utils/utils'
import GoogleButton from 'react-google-button'

function App() {
  const [items, setItems] = useState<TimeTrackedItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [modal, setModal] = useState<ModalConfig>({
    show: false,
    type: 'add',
  })
  const googleOAuthMetadata = useGoogleAuth(firebaseAuth)

  useEffect(() => {
    const helper = async () => {
      if (!googleOAuthMetadata.userId) return

      setLoadingItems(true)
      const docs = await getDocs(timesCollection(googleOAuthMetadata.userId))
      setLoadingItems(false)

      setItems(sortItems(getItemsFromFireStore(docs)))
    }
    helper()
  }, [googleOAuthMetadata.userId])

  if (googleOAuthMetadata.loading || loadingItems) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <InfinitySpin width="200" color="#26c6da" />
      </div>
    )
  }
  if (
    !googleOAuthMetadata.user &&
    googleOAuthMetadata.type === 'signInWithGoogle'
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <h1 className="text-3xl text-white font-sans p-4 font-light tracking-wide">
          Time Tracker
        </h1>
        <GoogleButton onClick={() => googleOAuthMetadata.signInWithGoogle()} />
      </div>
    )
  }

  const deleteItem = async (item: TimeTrackedItem) => {
    const { id: itemId } = item
    await deleteDoc(itemDocument(googleOAuthMetadata.userId!, itemId))
    setItems((items) => items.filter((item) => item.id !== itemId))
    setModal((modal) => ({
      ...modal,
      show: false,
    }))
  }

  const showItemDetails = (item: TimeTrackedItem) => {
    setModal({
      show: true,
      type: 'edit',
      item,
    })
  }

  return (
    <div className="min-h-screen">
      <h1 className="text-3xl text-white font-sans p-4 font-light tracking-wide">
        Time Tracker
      </h1>
      <div className="flex flex-col gap-4 p-4">
        {items.length ? (
          items.map((item) => (
            <Item key={item.id} item={item} showDetails={showItemDetails} />
          ))
        ) : (
          <p className="text-white">No items to show</p>
        )}
      </div>
      <button
        onClick={() =>
          setModal({
            show: true,
            type: 'add',
          })
        }
        className="text-white border-white border-2 rounded-md p-2 m-4 hover:text-black hover:shadow-[inset_13rem_0_0_0] hover:shadow-white duration-[1000ms,1000ms] transition-[color,box-shadow] active:scale-90"
      >
        Add Item
      </button>
      <button
        onClick={async () => {
          await firebaseAuth.signOut()
          window.location.reload()
        }}
        className="text-white border-2 rounded-md p-2 bg-red-500 border-red-500 hover:bg-red-700 transition active:scale-90"
      >
        Sign Out
      </button>
      <ItemModal
        modal={modal}
        setItems={setItems}
        setModal={setModal}
        userId={googleOAuthMetadata.userId!}
        deleteItem={deleteItem}
      />
    </div>
  )
}

export default App
