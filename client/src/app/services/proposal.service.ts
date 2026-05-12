import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Proposal } from '../model/proposal';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProposalService {

  private api=environment.apiUrl
 
  //Write your logic or code here 

}
