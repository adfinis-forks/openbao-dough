import { Button } from '@/shared/components/common/Button';
import { Lock } from '@/shared/components/common/Icons';

export function SealView() {
  return (
    <div className="seal-view">
      <h1>Seal OpenBao</h1>
      <p>
        Sealing an OpenBao instance tells the OpenBao server to stop responding
        to any access operations until it is unsealed again. A sealed instance
        throws away its root key to unlock the data, so it physically is blocked
        from responding to operations again until OpenBao is unsealed again with
        the "unseal" command or via the API.{' '}
      </p>
      <Button variant="outlined-danger" icon={<Lock size={16} />}>
        Seal OpenBao
      </Button>
    </div>
  );
}
