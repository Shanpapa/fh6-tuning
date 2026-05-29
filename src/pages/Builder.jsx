import { useParams } from 'react-router-dom'

export default function Builder() {
  const { id } = useParams()
  return (
    <div className="text-center py-24">
      <h1 className="font-barlow text-4xl font-bold text-text mb-2">Build Editor</h1>
      <p className="text-dim text-base">Coming in Session D — build_id: {id}</p>
    </div>
  )
}
