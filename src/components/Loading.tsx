import S from 's-js';
import * as Surplus from 'surplus';

/**
 * Re-usable loading widget, displays a placeholder while the given task is still executing.
 * 
 * @param task - signal bearing an executing task
 * @param placeholder (optional) - placeholder to display while task is executing, defaults to text "Loading..."
 * @param children - function which takes result value of completed task and renders final content
 */
export function Loading<T>({ task, placeholder = "Loading ...", children } : { task : () => Promise<T>, placeholder? : JSX.Children, children: (data : T) => JSX.Children }) {
    const data = S.value(null as null | T);
    S(() => { data(null); task().then(data); });
    return () => data() ? children(data()!) : placeholder;
}