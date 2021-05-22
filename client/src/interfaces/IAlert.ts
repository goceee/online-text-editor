import { Color } from '@material-ui/lab/Alert';

export default interface IAlert {
  showAlert: boolean;
  alertMessage: string;
  severityType: Color;
}
