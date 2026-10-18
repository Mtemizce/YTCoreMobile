import { WebScreen } from '../../components/WebScreen';
import { useSession } from '../../lib/session';
export default function Board() {
  const { session } = useSession();
  return <WebScreen path={session?.site?.board?.path || '/admin'} awake />;
}
