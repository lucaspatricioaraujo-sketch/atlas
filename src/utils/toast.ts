import { toast } from "sonner"

export const successToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
  })
}

export const errorToast = (message: string, description?: string) => {
  toast.error(message, {
    description,
  })
}

export const infoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
  })
}
