import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import { query as q } from "faunadb"

import { KeysList } from "../keys-list"

jest.mock("../../../activity-monitor", () => ({
  monitorActivity: x => x
}))

jest.mock("../../../notifications", () => ({
  watchForError: (msg, fn) => fn()
}))

jest.mock("react-router", () => ({
  browserHistory: { push: jest.fn() }
}))

const { browserHistory } = require("react-router")

describe("KeysList Component", () => {
  let comp, client

  beforeEach(() => {
    client = {
      query: jest.fn(() =>
        Promise.resolve("fake-key")
      )
    }

    comp = shallow(
      <KeysList
        dispatch={jest.fn(x => x)}
        client={client}
        path={["a-db"]}
        url="/db/a-db/databases" />
    )
  })

  it("should render an empty page", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("fetches keys", () => {
    comp.find("Connect(Pagination)").props().query()
    expect(client.query).toHaveBeenCalled()
  })

  it("fetch a key when clicked", () => {
    comp.find("Connect(Pagination)").simulate("selectRef", q.Ref("keys/123"))
    expect(client.query).toHaveBeenCalled()
  })

  it("displays the selected key", () => {
    return comp.find("Connect(Pagination)").props().onSelectRef(q.Ref("keys/123")).then(() => {
      comp.update()
      expect(shallowToJson(comp)).toMatchSnapshot() // returned key will be present
    })
  })

  it("redirect to database when database ref is cliekced", () => {
    comp.find("Connect(Pagination)").props().onSelectRef(q.Ref("databases/my-blog"))
    expect(browserHistory.push).toHaveBeenCalledWith("/db/a-db/my-blog/databases")
  })
})
