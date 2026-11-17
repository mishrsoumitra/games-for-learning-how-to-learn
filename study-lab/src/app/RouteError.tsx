import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const message = error instanceof Error ? error.message : '';
  return (
    <main className="narrow">
      <div className="page-head">
        <p className="kicker">Something went wrong</p>
        <h1>{notFound ? 'That page does not exist' : 'The page could not be shown'}</h1>
        <p className="lead">
          {notFound
            ? 'Check the address, or go back to the home page.'
            : 'Your saved data is safe. Reload the page and try again. If it keeps happening, export a backup from Settings and tell your teacher.'}
        </p>
      </div>
      {message !== '' && (
        <p className="small muted">
          Error: <code>{message}</code>
        </p>
      )}
      <div className="btn-group">
        <Link className="btn" to="/">
          Go to the home page
        </Link>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    </main>
  );
}
