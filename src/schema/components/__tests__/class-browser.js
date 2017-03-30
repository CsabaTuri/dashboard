import React from "react"
import { shallow } from "enzyme"
import { shallowToJson } from "enzyme-to-json"
import { query as q } from "faunadb"
import { Map, List } from "immutable"

import { ClassBrowser } from "../class-browser"

jest.mock("../../../notifications", () => ({ watchForError: (msg, fn) => fn() }))
jest.mock("../../../activity-monitor", () => ({ monitorActivity: jest.fn() }))
jest.mock("../../", () => ({ createIndex: jest.fn(() => () => null) }))

const { createIndex } = require("../../")

describe("ClassBrowser Component", () => {
  let comp,
    classWithClassIndex,
    classWithNonClassIndex,
    classWithoutIndex,
    client

  beforeEach(() => {
    client = {
      query: jest.fn(() => Promise.resolve({
        data: [{
          ref: q.Ref("classes/people/1"),
          data: { name: "Bob" }
        }]
      }))
    }

    classWithClassIndex = Map.of(
      "name", "people",
      "ref", q.Ref("classes/people"),
      "indexes", List.of(
        Map.of(
          "name", "all_people",
          "ref", q.Ref("indexes/all_people"),
          "terms", List(),
          "values", List()
        )
      )
    )

    classWithNonClassIndex = Map.of(
      "name", "people",
      "ref", q.Ref("classes/people"),
      "indexes", List.of(
        Map.of(
          "name", "all_people",
          "ref", q.Ref("indexes/all_people"),
          "terms", List(),
          "values", List.of(
            Map.of("field", List.of("data", "name"))
          )
        )
      )
    )

    classWithoutIndex = Map.of(
      "name", "users",
      "ref", q.Ref("classes/users"),
      "indexes", List.of()
    )

    comp = shallow(
      <ClassBrowser
        dispatch={jest.fn(x => x)}
        isBusy={false}
        client={client}
        clazz={classWithClassIndex}
        databaseUrl="/db/a-db/databases"
        path={["a-db"]} />
    )
  })

  it("displays instances", () => {
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("should respond to changes in pagination", () => {
    comp.find("InstancesList").props().query({ size: 1 })
    expect(client.query).toHaveBeenCalled()
  })

  it("should respond to selected ref", () => {
    comp.find("InstancesList").simulate("selectRef", "a-ref")
    expect(client.query).toHaveBeenCalled()
  })

  it("should display new index button when no class index", () => {
    comp.setProps({ clazz: classWithoutIndex })
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("should disable create index button when busy", () => {
    comp.setProps({ clazz: classWithoutIndex, isBusy: true })
    expect(shallowToJson(comp)).toMatchSnapshot()
  })

  it("should be able to create a new class index", () => {
    comp.setProps({ clazz: classWithoutIndex })
    comp.find("Button").simulate("click", { preventDefault: jest.fn() })

    expect(createIndex).toHaveBeenLastCalledWith(client, ["a-db"], {
      name: "all_users",
      source: q.Ref("classes/users")
    })
  })

  it("should find a non conflicting name for new index", () => {
    comp.setProps({ clazz: classWithNonClassIndex })
    comp.find("Button").simulate("click", { preventDefault: jest.fn() })

    expect(createIndex).toHaveBeenLastCalledWith(client, ["a-db"], {
      name: "all_people_1",
      source: q.Ref("classes/people")
    })
  })
})
