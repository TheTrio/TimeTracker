import {
  DocumentData,
  QuerySnapshot,
  collection,
  doc,
} from 'firebase/firestore'
import { TimeFormat, TimeTrackedItem } from '../types'
import { firebaseDb } from '../firebase/firebase'

function formatDateDifference(
  date1: Date,
  date2: Date,
  format: TimeFormat
): string {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime())

  const years = format.years
    ? Math.floor(timeDiff / (365 * 24 * 60 * 60 * 1000))
    : 0
  const remainingTime = timeDiff - years * (365 * 24 * 60 * 60 * 1000)

  const months = format.months
    ? Math.floor(remainingTime / (30 * 24 * 60 * 60 * 1000))
    : 0
  const remainingTimeAfterMonths =
    remainingTime - months * (30 * 24 * 60 * 60 * 1000)

  const days = format.days
    ? Math.floor(remainingTimeAfterMonths / (24 * 60 * 60 * 1000))
    : 0
  const remainingTimeAfterDays =
    remainingTimeAfterMonths - days * (24 * 60 * 60 * 1000)

  const hours = format.hours
    ? Math.floor(remainingTimeAfterDays / (60 * 60 * 1000))
    : 0
  const remainingTimeAfterHours =
    remainingTimeAfterDays - hours * (60 * 60 * 1000)

  const minutes = format.minutes
    ? Math.floor(remainingTimeAfterHours / (60 * 1000))
    : 0
  const remainingTimeAfterMinutes =
    remainingTimeAfterHours - minutes * (60 * 1000)

  const seconds = format.seconds
    ? Math.floor(remainingTimeAfterMinutes / 1000)
    : 0

  const formattedDifference = []

  if (years > 0) {
    formattedDifference.push(`${years}y`)
  }
  if (months > 0) {
    formattedDifference.push(`${months}m`)
  }
  if (days > 0) {
    formattedDifference.push(`${days}d`)
  }
  if (format.hours && format.minutes && format.seconds) {
    formattedDifference.push(
      `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`
    )
  } else {
    if (hours > 0) {
      formattedDifference.push(`${hours}h`)
    }
    if (minutes > 0) {
      formattedDifference.push(`${minutes}m`)
    }
    if (seconds > 0) {
      formattedDifference.push(`${seconds}s`)
    }
  }

  return formattedDifference.join(' ')
}

function padNumber(number: number): string {
  return number < 10 ? `0${number}` : `${number}`
}

export function getTimeSince(item: TimeTrackedItem): string {
  const now = new Date()
  const { startsAt, format, countdown } = item
  if (countdown && startsAt.getTime() < now.getTime()) {
    return '00:00:00'
  }

  return formatDateDifference(startsAt, now, format ?? DEFAULT_TIME_FORMAT)
}

export const DEFAULT_TIME_FORMAT: TimeFormat = {
  years: true,
  days: true,
  hours: true,
  minutes: true,
  seconds: true,
}

export const sortItems = (items: TimeTrackedItem[]): TimeTrackedItem[] => {
  items = [...items]
  return items.sort((a, b) => {
    if (a.countdown && !b.countdown) return -1
    if (!a.countdown && b.countdown) return 1
    if (a.countdown && b.countdown)
      return a.startsAt.getTime() - b.startsAt.getTime()
    return b.startsAt.getTime() - a.startsAt.getTime()
  })
}

export const getItemsFromFireStore = (
  docs: QuerySnapshot<DocumentData, DocumentData>
) => {
  return docs.docs.map(
    (doc) =>
      ({
        ...doc.data(),
        startsAt: doc.data().startsAt.toDate(),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        id: doc._key.path.segments.at(-1),
      } as TimeTrackedItem)
  )
}

export const timesCollection = (userId: string) =>
  collection(firebaseDb, 'users', userId, 'times')

export const itemDocument = (userId: string, itemId: string) =>
  doc(firebaseDb, 'users', userId, 'times', itemId)

export const isCountdown = (time: Date) => time.getTime() > Date.now()

export const toTitleCase = (str: string) => {
  return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase())
}

export const TIME_FRAMES = [
  'years',
  'months',
  'days',
  'hours',
  'minutes',
  'seconds',
]

export const convertDateToUTC = (date: Date) =>
  new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  )
