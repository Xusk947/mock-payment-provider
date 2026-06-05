export function getStatusVariant(status: string | undefined | null) {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'captured':
    case 'authorized':
      return 'default' as const
    case 'pending':
      return 'secondary' as const
    case 'failed':
    case 'declined':
      return 'destructive' as const
    case 'refunded':
      return 'outline' as const
    default:
      return 'secondary' as const
  }
}
