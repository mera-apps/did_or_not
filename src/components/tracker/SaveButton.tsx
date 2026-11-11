import { Save } from 'lucide-react';
import { Button } from '../ui/primitives';

export default function SaveButton({
  onClick,
  saving,
  disabled,
}: {
  onClick: () => void;
  saving: boolean;
  disabled: boolean;
}) {
  return (
    <Button onClick={onClick} disabled={saving || disabled} className="w-full py-3.5 text-base">
      <Save size={18} /> {saving ? 'Saving…' : 'Save'}
    </Button>
  );
}
