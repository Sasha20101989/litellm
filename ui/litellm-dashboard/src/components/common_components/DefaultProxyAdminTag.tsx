import { Badge } from "@/components/ui/badge";
import { DEFAULT_PROXY_ADMIN_USER_ID } from "@/utils/sentinels";

interface DefaultProxyAdminTagProps {
  userId: string | null | undefined;
  label?: string;
}

export default function DefaultProxyAdminTag({ userId, label = "Default Proxy Admin" }: DefaultProxyAdminTagProps) {
  if (userId === DEFAULT_PROXY_ADMIN_USER_ID) {
    return <Badge variant="secondary">{label}</Badge>;
  }

  return <span>{userId}</span>;
}
