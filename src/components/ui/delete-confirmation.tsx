import { ConfirmationDialog } from "./confirmation-dialog"
import { buttonVariants } from "@/components/ui/button"

interface DeleteConfirmationProps {
  itemName?: string
  onConfirm: () => void
  trigger?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DeleteConfirmation({
  itemName = "este item",
  onConfirm,
  trigger,
  isOpen,
  onOpenChange,
}: DeleteConfirmationProps) {
  return (
    <ConfirmationDialog
      title="Excluir Permanentemente?"
      description={`Você tem certeza que deseja excluir ${itemName}? Esta ação não pode ser desfeita e os dados serão removidos permanentemente dos nossos servidores.`}
      confirmText="Excluir"
      onConfirm={onConfirm}
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    />
  )
}
