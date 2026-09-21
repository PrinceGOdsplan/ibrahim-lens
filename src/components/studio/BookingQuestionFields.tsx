import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { studioBookingFieldCopy, studioManualBookingQuestions, type FormFieldDef } from '@/lib/website'

/** Studio fields for session facts from the website questions, with photographer labels. */
export function BookingQuestionFields({
  fields,
  values,
  onChange,
  idPrefix,
}: {
  fields: FormFieldDef[]
  values: Record<string, string>
  onChange: (id: string, value: string) => void
  idPrefix: string
}) {
  const visible = studioManualBookingQuestions(fields)
  if (!visible.length) return null

  return (
    <>
      {visible.map((field) => {
        const controlId = `${idPrefix}-${field.id}`
        const copy = studioBookingFieldCopy(field)
        return (
          <div key={field.id}>
            <Label htmlFor={controlId}>{copy.label}</Label>
            {field.type === 'choice' || field.type === 'yesno' ? (
              <Select
                id={controlId}
                className="mt-1"
                value={values[field.id] ?? ''}
                onChange={(e) => onChange(field.id, e.target.value)}
              >
                <option value="">—</option>
                {(field.type === 'yesno' ? ['yes', 'no'] : field.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {field.type === 'yesno' ? (opt === 'yes' ? 'Yes' : 'No') : opt}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                id={controlId}
                className="mt-1"
                type={field.type === 'email' ? 'email' : 'text'}
                placeholder={copy.placeholder}
                value={values[field.id] ?? ''}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            )}
          </div>
        )
      })}
    </>
  )
}
