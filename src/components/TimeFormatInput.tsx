import { TimeFormat } from '../types'
import { toTitleCase } from '../utils/utils'

type Props = {
  type: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds'
  defaults: TimeFormat
}

export const TimeFormatInput = (props: Props) => {
  return (
    <div className="flex gap-1 justify-start w-max items-center">
      <input
        type="checkbox"
        name={props.type}
        id={props.type}
        defaultChecked={props.defaults[props.type]}
      />
      <label htmlFor={props.type}>{toTitleCase(props.type)}</label>
    </div>
  )
}
