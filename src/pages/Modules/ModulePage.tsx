import React from 'react';
import { view } from 'react-easy-state';
import ModuleList from '~modules/ModuleList';
import { Modules, Auth } from '~store';
import { getModules, getCurrentUser } from '~api';

@view
export default class extends React.Component {
  public componentDidMount = async () => {
    const moduleResponse = await getModules();
    Modules.store.modules = moduleResponse.modules;

    const currentUserResponse = await getCurrentUser();

    if (currentUserResponse.ok) {
      Auth.store.user = currentUserResponse.value;
    }
  }

  public render() {
    return (
      <ModuleList />
    );
  }
}
