import React, { useReducer, useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import Paginate from 'components/Paginate'
import SortableTable from 'components/SortableTable'
import useCollections from 'utils/useCollections'
import useBackendApi from 'utils/useBackendApi'

import CreateCollection from './_New'

function reducer(state, newState) {
  return { ...state, ...newState }
}

const AdminCollections = () => {
  const history = useHistory()
  const { post } = useBackendApi({ authToken: true })
  const { collections } = useCollections()
  const [state, setState] = useReducer(reducer, {
    collections: []
  })
  useEffect(() => {
    setState({ collections })
  }, [collections])

  const sortedCollections = [...state.collections]
  const { dragging, dragTarget } = state
  const isDragging = typeof dragging === 'number'
  if (isDragging && typeof dragTarget === 'number') {
    sortedCollections.splice(dragging, 1)
    sortedCollections.splice(dragTarget, 0, state.collections[dragging])
  }

  return (
    <>
      <h3 className="admin-title">
        Collections
        <div className="ml-auto">
          <CreateCollection />
        </div>
      </h3>
      <SortableTable
        items={collections}
        onClick={(collection) => {
          history.push(`/admin/collections/${collection.id}`)
        }}
        onChange={(collections) =>
          post('/collections', {
            method: 'PUT',
            body: JSON.stringify({ collections })
          })
        }
      >
        {(item, DragTarget) => (
          <>
            <div className="td title">
              <div className="draggable-content" draggable>
                <DragTarget />
                {item.title}
              </div>
            </div>
            <div className="td justify-content-center">
              {item.products.length}
            </div>
          </>
        )}
      </SortableTable>
      <Paginate total={collections.length} />
    </>
  )
}

export default AdminCollections

require('react-styl')(`

`)
