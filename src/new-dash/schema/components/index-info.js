import React from "react"
import { connect } from "react-redux"
import { Link } from "react-router"

import { selectedIndex } from "../"

const IndexInfo = ({ index }) => {
  return <div>
    <h3>Index Details</h3>

    <div className="ms-Grid-row">
      <div className="ms-Grid-col ms-u-sm12 ms-u-md6">
        <dl>
          <dt>Name</dt><dd>{index.get("name")}</dd>
          <dt>Source</dt>
          <dd>
            <Link to={index.getIn(["source", "url"])}>
              {index.getIn(["source", "name"])}
            </Link>
          </dd>
        </dl>
      </div>
      <div className="ms-Grid-col ms-u-sm12 ms-u-md6">
        <dl>
          <dt>Active</dt><dd>{index.get("active").toString()}</dd>
          <dt>Unique</dt><dd>{index.get("unique").toString()}</dd>
          <dt>Partitions</dt><dd>{index.get("partitions")}</dd>
        </dl>
      </div>
    </div>

    <div className="ms-Grid-row">
      <div className="ms-Grid-col ms-u-sm12 ms-u-md6">
        <h3>Terms</h3>
        <ul>
          {index.get("terms").map(term => (
            <li key={`term-${term}`}>{term}</li>)
          )}
        </ul>
      </div>
      <div className="ms-Grid-col ms-u-sm12 ms-u-md6">
        <h3>Values</h3>
        <ul>
          {index.get("values").map(value => (
            <li key={`value-${value}`}>{value}</li>)
          )}
        </ul>
      </div>
    </div>
  </div>
}

export default connect(
  state => ({
    index: selectedIndex(state)
  })
)(IndexInfo)
