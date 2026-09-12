import { useQuery } from '@tanstack/react-query'
import { listMyItems } from '@meperdi/api-client'

export function useMyItems() {
  return useQuery({ queryKey: ['owner-items'], queryFn: listMyItems })
}
