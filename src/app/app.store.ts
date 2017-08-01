
import {createStore, applyMiddleware } from "redux";
import {AppState} from "./appState";
import thunk from 'redux-thunk';
import {Http} from "@angular/http";
import {Injectable} from "@angular/core";
import "rxjs/add/operator/toPromise";
import {perfCounterMiddleware} from "../profiler/counters/counter.redux";

function reducer(state: AppState, action) {
  if(state == undefined) {
    return {
      contacts: null,
    }
  }

  if(action.type == "SET_CONTACTS") {
    return {
      ...state,
      contacts: action.contacts,
    }
  }

  return state;
}

export const appStore = createStore(reducer, applyMiddleware(perfCounterMiddleware, thunk));

@Injectable()
export class ContactThunk {
  constructor(private http: Http) {
  }

  loadAll() {
    return async (dispatch, getState) => {
      const state: AppState = getState();

      if(state.contacts) {
        return;
      }

      dispatch(this.refresh());
    }
  }

  refresh() {
    return async (dispatch, getState) => {
      const res = await this.http.get("/assets/contacts.json").toPromise();
      const contacts = res.json();

      console.log("contacts are", contacts);

      dispatch({
        type: "SET_CONTACTS",
        contacts: contacts
      });
    }
  }
}
