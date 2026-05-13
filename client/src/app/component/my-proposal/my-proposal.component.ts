import { Component, OnInit } from '@angular/core';
import { ProposalService } from '../../services/proposal.service';
import { Proposal } from '../../model/proposal';

@Component({
  selector: 'app-my-proposal',
  templateUrl: './my-proposal.component.html',
  styleUrls: ['./my-proposal.component.scss']
})
export class MyProposalComponent implements OnInit{

  proposals: any[] = [];

  constructor(private service: ProposalService) {}

  ngOnInit() {
    this.service.getMyProposals().subscribe((res: any) => {
      this.proposals = res;
    });
  }


}