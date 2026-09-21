import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'
import {
  mediaImageSources,
  type ImageWidthKey,
  type MediaRecord,
} from '@/lib/library'
import {
  detectSubjectFocus,
  fallbackSubjectFocus,
  objectPosition,
  storedSubjectFocus,
  type SubjectFocus,
} from '@/lib/subject-focus'
import { cn } from '@/lib/utils'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  record: MediaRecord
  widthKey?: ImageWidthKey
}

/** Fills its box with object-cover, pinned to the person in the frame. */
export function SubjectCover({ record, widthKey = 'column', className, style, alt, onLoad, ...rest }: Props) {
  const stored = storedSubjectFocus(record)
  const pinned = useRef(Boolean(stored))
  const [focus, setFocus] = useState<SubjectFocus>(stored ?? fallbackSubjectFocus())

  useEffect(() => {
    const fromRecord = storedSubjectFocus(record)
    if (fromRecord) {
      pinned.current = true
      setFocus(fromRecord)
      return
    }
    pinned.current = false
    let cancelled = false
    detectSubjectFocus(record).then((found) => {
      if (cancelled || !found) return
      pinned.current = true
      setFocus(found)
    })
    return () => {
      cancelled = true
    }
  }, [record])

  return (
    <img
      {...mediaImageSources(record, widthKey)}
      {...rest}
      alt={alt ?? ''}
      className={cn('h-full w-full object-cover', className)}
      style={{ ...style, objectPosition: objectPosition(focus) }}
      onLoad={(event) => {
        onLoad?.(event)
        if (pinned.current) return
        setFocus(fallbackSubjectFocus(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight))
      }}
    />
  )
}
