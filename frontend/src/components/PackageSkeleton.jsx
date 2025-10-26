import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function PackageSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <Skeleton height={24} width={120} className="mb-2" baseColor="#e5e7eb" highlightColor="#f3f4f6" />
      <Skeleton height={36} width={80} className="mb-4" baseColor="#e5e7eb" highlightColor="#f3f4f6" />
      <Skeleton count={3} className="mb-2" baseColor="#e5e7eb" highlightColor="#f3f4f6" />
      <Skeleton height={44} className="mt-4" baseColor="#e5e7eb" highlightColor="#f3f4f6" />
    </div>
  )
}
