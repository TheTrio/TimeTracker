export type TimeTrackedItem = {
  id: string
  name: string
  startsAt: Date
  format?: TimeFormat
  countdown: boolean
}

export type TimeFormat = {
  years?: boolean
  months?: boolean
  days?: boolean
  hours?: boolean
  minutes?: boolean
  seconds?: boolean
}

export type ModalConfig = {
  show: boolean
} & (
  | {
      type: 'add'
    }
  | {
      type: 'edit'
      item: TimeTrackedItem
    }
)
