import { get } from 'lodash';
import {
  PlatformNotebook,
  NeptuneClientMsg,
} from 'types/platform';


class Notebook implements PlatformNotebook {
  async getContent() {
    return Jupyter.notebook.toJSON();
  }

  getMetadata() {
    const notebook = Jupyter.notebook;
    const {
      notebook_path,
    } = notebook;

    const notebookId = get(notebook, 'metadata.neptune.notebookId');

    return {
      path: notebook_path,
      notebookId,
    };
  }

  async saveNotebookId(notebookId: string) {
    Jupyter.notebook.metadata.neptune = {
      notebookId,
    };
    Jupyter.notebook.save_checkpoint();
  }

  async registerNeptuneMessageListener(callback: (msg: NeptuneClientMsg) => void) {
    Jupyter.notebook.kernel.comm_manager.register_target(
      'neptune_comm',
      (comm: NbComm) => {
        comm.on_msg((msg: NbCommMsgMsg) => {
          callback(msg.content.data as NeptuneClientMsg);
        });
      }
    );
  }
}

export default Notebook;
