import { api } from '@/lib/axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Text, TextArea, TextInput } from '@ignite-ui/react'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { CalendarBlank, Clock } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ConfirmForm, FormActions, FormError, FormHeader } from './styles'

const confirmFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome precisa no mínimo 3 caracteres' }),
  email: z.string().email({ message: 'Digite um e-mail válido' }),
  observations: z.string().nullable(),
})

type confirmFormData = z.infer<typeof confirmFormSchema>

interface ConfirmStepProps {
  schedulingDate: Date
  onCancelConfirmation: () => void
}

export function ConfirmStep({
  schedulingDate,
  onCancelConfirmation,
}: ConfirmStepProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<confirmFormData>({
    resolver: zodResolver(confirmFormSchema),
  })

  const router = useRouter()
  const username = String(router.query.username)

  async function handleConfirmScheduling(data: confirmFormData) {
    const { name, email, observations } = data

    await api.post(`/users/${username}/schedule`, {
      name,
      email,
      observations,
      date: schedulingDate,
    })

    onCancelConfirmation()
  }

  const describeDate = dayjs(schedulingDate).format('DD[ de ]MMMM[ de ]YYYY')
  const describeTime = dayjs(schedulingDate).format('HH:mm[H]')

  return (
    <ConfirmForm as="form" onSubmit={handleSubmit(handleConfirmScheduling)}>
      <FormHeader>
        <Text>
          <CalendarBlank />
          {describeDate}
        </Text>
        <Text>
          <Clock />
          {describeTime}
        </Text>
      </FormHeader>

      <label>
        <Text size="sm">Nome completo</Text>
        <TextInput
          crossOrigin={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          placeholder="Seu nome"
          {...register('name')}
        />
        {errors.name && <FormError size="sm">{errors.name.message}</FormError>}
      </label>

      <label>
        <Text size="sm">Endereço de e-mail</Text>
        <TextInput
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          crossOrigin={undefined}
          placeholder="johndoe@example.com"
          {...register('email')}
        />
        {errors.email && (
          <FormError size="sm">{errors.email.message}</FormError>
        )}
      </label>

      <label>
        <Text size="sm">Observações</Text>
        <TextArea {...register('observations')} />
      </label>

      <FormActions>
        <Button
          onClick={onCancelConfirmation}
          disabled={isSubmitting}
          type="button"
          variant="tertiary"
        >
          Cancelar
        </Button>
        <Button type="submit">Confirmar</Button>
      </FormActions>
    </ConfirmForm>
  )
}
