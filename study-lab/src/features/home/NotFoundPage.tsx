import { Link } from 'react-router';
import { PageHead } from '../../components/PageHead.tsx';

export default function NotFoundPage() {
  return (
    <div className="narrow">
      <PageHead
        kicker="Not found"
        title="That page does not exist"
        lead="Check the address, or go back to the home page and pick an activity from there."
      />
      <Link className="btn" to="/">
        Go to the home page
      </Link>
    </div>
  );
}
