import { reduceNotifications, notify, watchForError } from "../"

const successfull = () => Promise.resolve(42)
const failure = () => Promise.reject(new Error("Fail"))

describe("Given a notification store", () => {
  let store, notifications

  beforeEach(() => {
    jest.useFakeTimers()
    notifications = []

    store = createImmutableTestStore({ notifications: reduceNotifications })(
      state => notifications = state.get("notifications").toJS()
    )
  })

  it("should notify on success", () => {
    return store.dispatch(notify("Uhull!", successfull)).then(finalResult => {
      expect(notifications).toEqual([{ type: "success", message: "Uhull!" }])
      expect(finalResult).toEqual(42)
    })
  })

  it("should notify on failure", () => {
    return store.dispatch(notify("Should fail!", failure)).catch(finalError => {
      expect(notifications).toEqual([{ type: "error", message: "Error: Fail" }])
      expect(finalError).toEqual(new Error("Fail"))
    })
  })

  it("should remove notifications after a while", () => {
    return store.dispatch(notify("Uhull!", successfull)).then(finalResult => {
      expect(notifications.length).toEqual(1)
      jest.runAllTimers()
      expect(notifications.length).toEqual(0)
    })
  })

  describe("when watching for errors", () => {
    it("should notify for errors only", () => {
      return store.dispatch(watchForError("Some error", failure)).catch(finalError => {
        expect(notifications).toEqual([{ type: "error", message: "Some error. Error: Fail" }])
        expect(finalError).toEqual(new Error("Fail"))
      })
    })

    it("should notify for errors when exception is thrown", () => {
      return store.dispatch(watchForError(null, () => { throw "Some error" })).catch(finalError => {
        expect(notifications).toEqual([{ type: "error", message: "Some error" }])
        expect(finalError).toEqual("Some error")
      })
    })

    it("should not notify on success", () => {
      return store.dispatch(watchForError("Some error", successfull)).then(finalResult => {
        expect(notifications).toEqual([])
        expect(finalResult).toEqual(42)
      })
    })
  })
})
