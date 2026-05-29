import { useParams } from 'react-router-dom'

export default function Advisor() {
  const { id } = useParams()
  return (
    <div className="text-center py-24">
      <h1 className="font-barlow text-4xl font-bold text-text mb-2">Build Advisor</h1>
      <p className="text-dim text-base">Coming in Session E — build_id: {id}</p>
    </div>
  )
}
