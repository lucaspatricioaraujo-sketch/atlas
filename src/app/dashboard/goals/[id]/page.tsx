import { GoalDetails } from "@/features/goals/components/GoalDetails"

interface GoalDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params
  return <GoalDetails id={id} />
}
