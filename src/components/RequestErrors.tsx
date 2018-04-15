import S from 's-js';
import * as Surplus from 'surplus';
import { RequestErrors as RequestErrorsT } from '../app/client';

/**
 * Re-usable component that watches a request for UNPROCESSABLE (422) responses
 * indicating validation or business-logic failures in the request, and displays
 * the provided error messages.
 * 
 * @param request - a signal bearing the request to watch, or null
 */
export const RequestErrors = ({ request } : { request : () => null | Promise<any> }) => {
    const errors = S.value(null as RequestErrorsT | null);
    
    S.on(request, () => {
        errors(null);

        if (request()) request()!.catch(e => {
            if (e instanceof Response && e.status === 422) {
                e.json().then(errors);
            }
            throw e;
        });
    });

    return (
        <ul class="error-messages" hidden={!errors()}>
            {errors() && Object.keys(errors()!.errors).map(field =>
                errors()!.errors[field].map(error =>
                    <li>{field} {error}</li>
                )
            )}
        </ul>
    );
}
