import { useParams } from 'react-router-dom'

export default function CarDetail() {
  const { id } = useParams()
  return (
    <div className="text-center py-24">
      <h1 className="font-barlow text-4xl font-bold text-text mb-2">Car Detail</h1>
      <p className="text-dim text-base">Coming in Session B — car_id: {id}</p>
    </div>
  )
}
