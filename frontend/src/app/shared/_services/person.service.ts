import { HttpResourceRef, httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE } from '@core/api.constants';
import { PersonDto, PersonRole } from '@shared/_models/person.model';

@Injectable({ providedIn: 'root' })
export class PersonService {
  private readonly url = `${API_BASE}/persons`;

  personsResource(role?: PersonRole): HttpResourceRef<PersonDto[] | undefined> {
    return httpResource<PersonDto[]>(() => ({ url: this.url, params: role ? { role } : undefined }));
  }
}
