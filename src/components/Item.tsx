import { TimeTrackedItem } from '../types'
import { getTimeSince } from '../utils/utils'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

export function Item(props: {
  item: TimeTrackedItem
  showDetails: (item: TimeTrackedItem) => void
}) {
  const { item, showDetails } = props
  const [timeSince, setTimeSince] = useState(getTimeSince(item))
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSince(getTimeSince(item))
    }, 1000)
    return () => clearInterval(interval)
  }, [item])

  return (
    <div className="w-max flex text-white gap-2 items-center">
      <div
        className={clsx(
          'bg-cyan-400 p-2 rounded font-semibold text-black tabular-nums hover:cursor-pointer',
          {
            'bg-red-400': item.countdown,
          }
        )}
        onClick={() => {
          showDetails(item)
        }}
      >
        {timeSince}
      </div>
      {item.name}
    </div>
  )
}
