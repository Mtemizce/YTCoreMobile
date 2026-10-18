import { WebScreen } from '../../components/WebScreen';
import { useSession } from '../../lib/session';
export default function Courier() {
  const { session } = useSession();
  return <WebScreen path={session?.site?.courier?.path || '/admin/kurye'} />;
}
