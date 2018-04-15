import S from 's-js';
import * as Surplus from "surplus";
import data from 'surplus-mixin-data';

import { App } from '../app/app';
import { Article, NewArticle } from '../app/client';

import { Page, MenuSection } from "./Page";
import { TagList } from './TagList';
import { RequestErrors } from './RequestErrors';

export { EditorRoute };

type EditorModel = ReturnType<typeof EditorModel>;
const 
    EditorRoute = async (app : App, slug : string) => {
        const article = !slug ? null : (await app.client.article.get(slug)).article;
        const model = EditorModel(app, article, a => app.location.change(`#/article/${a.slug}`));
        return () => <EditorPage {...model} />;
    },
    EditorModel = (app : App, article : Article | null, onPublish: (a : Article) => void) => {
        const title = S.value(article ? article.title : ""),
            description = S.value(article ? article.description : ""),
            body = S.value(article ? article.body : ""),
            tags = S.value(article ? article.tagList.join(" ") : ""),
            tagList = () => tags().match(/\S+/g) || [],
            request = S.data(null as Promise<any> | null),
            publish = () => {
                const data = {
                    title: title(),
                    description: description(),
                    body: body(),
                    tagList: tagList()
                },
                req = article 
                    ? app.client.article.put({ ...article, ...data }) 
                    : app.client.articles.post(data);
                request(req);
                req.then(s => onPublish(s.article));

                return false;
            };

        return { app, title, description, body, tags, tagList, request, publish };
    },
    EditorPage = (model : EditorModel) => (
        <Page app={model.app} title="Editor - Conduit" section={MenuSection.NewPost}>
            <Editor {...model} />
        </Page>
    ),
    Editor = ({ title, description, body, tags, tagList, publish, request } : EditorModel) => (
        <div class="editor-page">
            <div class="container page">
                <div class="row">
                    <div class="col-md-10 offset-md-1 col-xs-12">
                        <RequestErrors request={request} />
                        <form>
                            <fieldset>
                                <fieldset class="form-group">
                                    <input
                                        fn={data(title)}
                                        type="text"
                                        class="form-control form-control-lg"
                                        placeholder="Article Title"
                                    />
                                </fieldset>
                                <fieldset class="form-group">
                                    <input
                                        fn={data(description)}
                                        type="text"
                                        class="form-control"
                                        placeholder="What's this article about?"
                                    />
                                </fieldset>
                                <fieldset class="form-group">
                                    <textarea
                                        fn={data(body)}
                                        class="form-control"
                                        rows={8}
                                        placeholder="Write your article (in markdown)"
                                    />
                                </fieldset>
                                <fieldset class="form-group">
                                    <input
                                        fn={data(tags)}
                                        type="text"
                                        class="form-control"
                                        placeholder="Enter tags"
                                    />
                                    <TagList {...tagList()} />
                                </fieldset>
                                <button
                                    class="btn btn-lg pull-xs-right btn-primary"
                                    type="button"
                                    onClick={publish}
                                >
                                    Publish Article
                                </button>
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
