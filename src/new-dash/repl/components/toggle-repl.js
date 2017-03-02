import SplitPane from "react-split-pane"
import React, { Component } from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { List } from "immutable"
import { Button, ButtonType, Breadcrumb, Dropdown } from "office-ui-fabric-react"

import "./toggle-repl.css"
import { ReplEditor, evalQuery } from "../"
import { monitorActivity, isBusy } from "../../activity-monitor"
import { QueryResult } from "../../dataset"
import { faunaClient } from "../../authentication"
import { selectedResource, buildResourceUrl } from "../../router"

class ToggleRepl extends Component {
  constructor(props) {
    super(props)
    this.state = this.initialState()
  }

  initialState() {
    return {
      code: "q.Paginate(q.Ref(\"indexes\"))",
      selectedCode: "",
      isOpen: false,
      fullscreen: false,
      expandedSize: 300,
      privilege: null,
      result: null,
      error: null
    }
  }

  replSize() {
    const { isOpen, fullscreen, expandedSize } = this.state
    if (!isOpen) return 42
    if (fullscreen) return "100%"
    return expandedSize
  }

  componentWillReceiveProps(next) {
    if (this.props.faunaClient !== next.faunaClient) {
      this.setState({
        privilege: next.faunaClient.availablePrivileges[0]
      })
    }
  }

  onChange(field) {
    return value => this.setState({
      [field]: value
    })
  }

  onSelect(field) {
    return value => this.setState({
      [field]: value.key
    })
  }

  onToggle(field) {
    return value => this.setState({
      [field]: !this.state[field]
    })
  }

  buildBreadCrumbItem(path) {
    const buildForPath = (path) => {
      if (path.isEmpty()) return []
      const url = buildResourceUrl(null, path, "databases")

      return [{
        key: url,
        href: url,
        text: path.last(),
        onClick: this.onBreadCrumbClick.bind(this)
      }].concat(buildForPath(path.butLast()))
    }

    return buildForPath(path).reverse()
  }

  onBreadCrumbClick(e, link) {
    e.preventDefault()
    browserHistory.push(link.href)
  }

  executeQuery() {
    const { faunaClient, selectedPath } = this.props
    const { privilege, code, selectedCode } = this.state

    this.props.dispatch(
      monitorActivity(() =>
        evalQuery(q =>
          faunaClient.query(selectedPath, privilege, q)
        )(selectedCode || code)
      )
    ).then(
      (result) => this.setState({ result, error: null }),
      (error) => this.setState({ error, result: null })
    )
  }

  render() {
    if (!this.props.faunaClient) {
      return this.props.children
    }

    const breadcrumbItems = this
      .buildBreadCrumbItem(List.of("/"))
      .concat(this.buildBreadCrumbItem(this.props.selectedPath))

    const privileges = this.props.faunaClient.availablePrivileges
      .map(privilege => ({ key: privilege, text: privilege }))

    return <SplitPane
      className="toggle-repl"
      split="horizontal"
      primary="second"
      minSize="200"
      size={this.replSize()}
      allowResize={this.state.isOpen && !this.state.fullscreen}
      onChange={this.onChange("expandedSize")}>

      {this.props.children}

      <div>
        <div className="editor-area">
          <SplitPane
            split="vertical"
            defaultSize="50%">

            {this.state.isOpen ?
              <ReplEditor
                name="toggle-repl-editor"
                value={this.state.code}
                onChange={this.onChange("code")}
                onSelect={this.onChange("selectedCode")}
                shortcuts={[{
                  name: "execute",
                  bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
                  exec: this.executeQuery.bind(this)
                }]} /> : <div></div>}

            <div className="query-result">
              <div className="key-selector">
                Running with a
                <Dropdown
                  disabled={privileges.length < 2}
                  options={privileges}
                  selectedKey={this.state.privilege}
                  onChanged={this.onSelect("privilege")} />
                key.

                <Button
                  buttonType={ButtonType.icon}
                  icon={this.state.fullscreen ? "BackToWindow" : "FullScreen"}
                  onClick={this.onToggle("fullscreen")}
                  />
              </div>

              <QueryResult
                result={this.state.result}
                error={this.state.error} />
            </div>
          </SplitPane>
        </div>

        <div className="repl-bar">
          <div className="buttons">
            <Button
              disabled={!this.state.isOpen || this.props.isBusy}
              buttonType={ButtonType.primary}
              onClick={this.executeQuery.bind(this)}>
                Run
            </Button>

            <Button
              icon={this.state.isOpen ? "ChevronDown" : "ChevronUp"}
              buttonType={ButtonType.command}
              onClick={this.onToggle("isOpen")}>
                Toggle Query Console
            </Button>
          </div>

          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>
    </SplitPane>
  }
}

export default connect(
  state => ({
    isBusy: isBusy(state),
    faunaClient: faunaClient(state),
    selectedPath: selectedResource(state).getIn(["database", "path"])
  })
)(ToggleRepl)
