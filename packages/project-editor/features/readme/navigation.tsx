import React from "react";
import { makeObservable, observable, runInAction } from "mobx";
import { observer } from "mobx-react";

import { ProjectContext } from "project-editor/project/context";
import { EditorComponent } from "project-editor/project/EditorComponent";
import { NavigationComponent } from "project-editor/project/NavigationComponent";
import { IPanel } from "project-editor/store";
import { readTextFile } from "eez-studio-shared/util-electron";

export const ReadmeNavigation = observer(
    class ReadmeNavigation extends NavigationComponent {
        static contextType = ProjectContext;
        declare context: React.ContextType<typeof ProjectContext>;

        render() {
            return null;
        }
    }
);

export const ReadmeEditor = observer(
    class ReadmeEditor extends EditorComponent implements IPanel {
        static contextType = ProjectContext;
        declare context: React.ContextType<typeof ProjectContext>;

        divRef = React.createRef<HTMLDivElement>();

        text: string | undefined;

        constructor(props: any) {
            super(props);

            makeObservable(this, {
                text: observable
            });
        }

        componentDidMount() {
            if (this.divRef.current) {
                this.divRef.current.focus();
            }
            this.loadText();
        }

        componentDidUpdate() {
            this.loadText();
        }

        async loadText() {
            let text: string | undefined;

            if (this.context.project.readme.readmeFile) {
                try {
                    text = await readTextFile(
                        this.context.getAbsoluteFilePath(
                            this.context.project.readme.readmeFile
                        )
                    );
                } catch (err) {
                    console.error(err);
                }
            }

            runInAction(() => {
                this.text = text;
            });
        }

        // interface IPanel implementation
        get selectedObject() {
            return this.context.project.readme;
        }
        cutSelection() {}
        copySelection() {}
        pasteSelection() {}
        deleteSelection() {}
        onFocus = () => {
            this.context.navigationStore.setSelectedPanel(this);
        };

        render() {
            let html;

            let style: React.CSSProperties = {
                padding: 10
            };

            if (this.context.project.readme.readmeFile && this.text) {
                const showdown = require("showdown");
                const converter = new showdown.Converter();
                html = { __html: converter.makeHtml(this.text || "") };
            } else {
                html = { __html: "" };
                style.height = "100%";
            }

            return (
                <div
                    ref={this.divRef}
                    onFocus={this.onFocus}
                    tabIndex={0}
                    dangerouslySetInnerHTML={html}
                    style={style}
                />
            );
        }
    }
);