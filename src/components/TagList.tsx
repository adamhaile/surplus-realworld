import * as Surplus from 'surplus';

/**
 * Re-usable component displaying a list of tags
 * @param tags 
 */
export const TagList = (tags : string[]) =>
    <ul className="tag-list">
        {tags.map(tag =>
            <li className="tag-default tag-pill tag-outline">
                {tag}
            </li>
        )}
    </ul>;