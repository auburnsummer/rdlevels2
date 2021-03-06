import { h, Fragment, createContext } from 'preact';
import qs from "querystringify";
import {
    useState, useEffect, useMemo, StateUpdater,
} from "preact/hooks";
import { Header } from "./parts/Header";
import { Levels } from "./parts/Levels";

import { useLocation } from "./hooks/useLocation";
import { LanguageContext } from "./hooks/LanguageContext";

import { diff } from "./utils/helpers";
import { searchParser } from "./utils/searchParser";

// @ts-ignore
import texts from "../resources/text.yaml";

import "./App.css";
import { SortOptions } from './utils/constants';

const getText = (locale: string) => (id: string): string => texts[id][locale];

export function App() {
    const [lang, setLang] = useState("en");
    const text = useMemo(() => getText(lang), [lang]);

    const value = {lang, text, setLang};

    // default values for various query params.
    const queryDefaults = {
        q: "", // user's search query
        limit: "20",
        page: "0",
        show_x: "false",
        sort: 'newest',
    };

    // modified useLocation hook from wouter to also include the query string (bit after the ?)
    const [_location, _setLocation] = useLocation();

    // using _location, make a query object with the default values.
    const [location, query] = useMemo(() => {
        const merged = {
            ...queryDefaults,
            ...qs.parse(_location.search),
        }
        // then transform out from strings.
        return [_location.path, {
            ...merged,
            limit: parseInt(merged.limit),
            page: parseInt(merged.page),
            show_x: merged.show_x === 'true',
            sort: merged.sort as SortOptions,
        }]
    }, [_location]);

    // wrapper around wouter's setLocation that uses implicit default values from above
    const setLocation = (path: string, search: Record<string, string>, useCurrent: boolean = false) => {
        const curr = useCurrent ? {...qs.parse(_location.search), ...search} : search;
        const diffed = diff(curr, queryDefaults);
        _setLocation(`${path}${qs.stringify(diffed, true)}`);
    }

    // use searchParser to break up the query into seperate tag author search
    const processed = useMemo(() => searchParser(query.q), [query.q]);

    return (
        <LanguageContext.Provider value={value}>
            <div class="ap">
                <Header
                    _class="ap_header"
                    route={setLocation}
                    query={query} />
                <Levels _class="ap_levels" route={setLocation} {...processed} {...query} />
            </div>
        </LanguageContext.Provider>
    )
}
