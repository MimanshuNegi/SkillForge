import { Component, OnInit } from '@angular/core';
import { ProposalService } from '../../services/proposal.service';
import { Proposal } from '../../model/proposal';

@Component({
  selector: 'app-my-proposal',
  templateUrl: './my-proposal.component.html',
  styleUrls: ['./my-proposal.component.scss']
})
export class MyProposalComponent implements OnInit {

  proposals: any[] = [];
  isLoading: boolean = true;  // ✅ ADD THIS

  constructor(private service: ProposalService) {}

  ngOnInit(): void {
    this.isLoading = true;

    this.service.getMyProposals().subscribe({
      next: (res: any) => {
        this.proposals = res || [];
        this.isLoading = false;  // ✅
      },
      error: (err: any) => {
        console.error('Error fetching proposals', err);
        this.proposals = [];
        this.isLoading = false;  // ✅
      }
    });
  }
}