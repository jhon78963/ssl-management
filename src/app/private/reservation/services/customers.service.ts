import { Injectable } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Observable } from 'rxjs';
import { CreatedCustomer, Customer } from '../models/customer.model';
import { DniConsultation } from '../models/sunat.model';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  constructor(private apiService: ApiService) {}

  create(data: DniConsultation): Observable<CreatedCustomer> {
    return this.apiService.post('customers', data);
  }

  getByDni(id: number): Observable<Customer> {
    return this.apiService.get(`customers/dni/${id}`);
  }
}
