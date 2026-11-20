import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import EmptyState from '../../components/common/EmptyState'

export default function NotFoundPage() {
  return (
    <div className="container-page py-16">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you are looking for may have moved or no longer exists."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/" className="btn-primary">
              Back home
            </Link>
            <Link to="/shop" className="btn-outline">
              Browse shop
            </Link>
          </div>
        }
      />
    </div>
  )
}
