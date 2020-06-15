import React from 'react'
import { useHistory } from 'react-router-dom'

import { formInput, formFeedback } from 'utils/formHelpers'
import ConfirmationModal from 'components/ConfirmationModal'
import useSetState from 'utils/useSetState'
import useCollections from 'utils/useCollections'
import useBackendApi from 'utils/useBackendApi'
import { useStateValue } from 'data/state'

function validate(state) {
  const newState = {}

  if (!state.title) {
    newState.titleError = 'Enter a title'
  } else if (state.title.length < 3) {
    newState.titleError = 'Title is too short'
  }

  const valid = Object.keys(newState).every((f) => f.indexOf('Error') < 0)

  return { valid, newState: { ...state, ...newState } }
}

const AdminCreateCollection = ({ className = '' }) => {
  const history = useHistory()
  const [, dispatch] = useStateValue()
  const { collections } = useCollections()
  const [state, setState] = useSetState({ title: '' })
  const { post } = useBackendApi({ authToken: true })
  const input = formInput(state, (newState) => setState(newState))
  const Feedback = formFeedback(state)

  return (
    <ConfirmationModal
      className={`btn btn-outline-primary ${className}`}
      buttonText="Create"
      confirmText="Add a Collection"
      confirmedText="Collection created"
      proceedText="Add"
      cancelText="Cancel"
      onConfirm={() => {
        return post('/collections', {
          method: 'PUT',
          body: JSON.stringify({
            collections: [
              ...collections,
              {
                id: state.title.toLowerCase(),
                title: state.title,
                products: []
              }
            ]
          })
        })
      }}
      validate={() => {
        const { valid, newState } = validate(state)
        setState(newState)
        return valid
      }}
      onSuccess={() => {
        setState({}, true)
        dispatch({ type: 'reload', target: 'collections' })
        history.push({
          pathname: '/admin/collections',
          state: { scrollToTop: true }
        })
      }}
    >
      <div className="form-row mt-3">
        <label>Collection name</label>
        <input {...input('title')} autoFocus />
        {Feedback('title')}
      </div>
    </ConfirmationModal>
  )
}

export default AdminCreateCollection
