import { ChatPage } from "@/components"

interface ConversationPageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params
  return <ChatPage conversationId={id} />
}
