import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IRequest, IReqMutation, IReqFORMDATA } from '../../types/interfaces/http.interface';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  protected http = inject(HttpClient);

  getRequest(req: IRequest): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
    };
    const requestOptions = {
      headers: new HttpHeaders(headers),
    };
    if (req.qParams) {
      req.qParams['spinner'] = req.spinner
    } else {
      req.qParams = {
        spinner: req.spinner
      }
    }
    return this.http.get(req.url, { params: req.qParams, ...requestOptions });
  }

  postRequest(req: IReqMutation): Observable<any> {
    // const headers = {
    //   'Content-Type': 'application/json',
    // };
    const requestOptions = {
      // headers: new HttpHeaders(headers),
    };
    if (req.qParams) {
      req.qParams['spinner'] = req.spinner
    } else {
      req.qParams = {
        spinner: req.spinner
      }
    }
    return this.http.post(req.url, req.body, {
      params: req.qParams,
      ...requestOptions,
      responseType: 'json',
      withCredentials: true
    });
  }

  putRequest(req: IReqMutation): Observable<any> {
    if (req.qParams) {
      req.qParams['spinner'] = req.spinner
    } else {
      req.qParams = {
        spinner: req.spinner
      }
    }
    return this.http.put(req.url, req.body, { params: req.qParams, withCredentials: true });
  }

  patchRequest(req: IReqMutation): Observable<any> {
    if (req.qParams) {
      req.qParams['spinner'] = req.spinner
    } else {
      req.qParams = {
        spinner: req.spinner
      }
    }
    return this.http.patch(req.url, req.body, { params: req.qParams, withCredentials: true });
  }

  deleteRequest(req: IRequest): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
    };
    const requestOptions = {
      headers: new HttpHeaders(headers),
    };
    req.qParams ??= {
      ...req.qParams,
      spinner: req.spinner
    }
    return this.http.delete(req.url, { params: req.qParams, ...requestOptions, withCredentials: true });
  }

  postRequestFORMDATA(req: IReqFORMDATA): Observable<any> {
    req.qParams ??= {
      ...req.qParams,
      spinner: req.spinner
    }
    return this.http.post(req.url, req.data, { params: req.qParams, withCredentials: true });
  }

  getRequestFile(req: IRequest): Observable<File> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/octet-stream',
    });
    if (req.qParams) {
      req.qParams['spinner'] = req.spinner
    } else {
      req.qParams = {
        spinner: req.spinner
      }
    }
    return this.http
      .get(req.url, {
        observe: 'response',
        headers: headers,
        params: req.qParams,
        responseType: 'blob',
      }).pipe(
        map((res: any) => {
          let filename = 'download'
          const content_disposition = res.headers.get('Content-Disposition');
          const extract = content_disposition?.toString()?.split(';')[1];
          filename = extract?.split('=')[1]?.trim()?.replace(/(^"|"$)/g, '');
          const blob = new Blob([res.body], {
            type: 'application/octet-stream',
          });
          const file = new File([blob], filename, { type: blob.type });
          return file;
        })
      );
  }

  getRequestDownloadFile(req: IRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/octet-stream',
    });
    if (req.qParams) {
      req.qParams['spinner'] = req.spinner
    } else {
      req.qParams = {
        spinner: req.spinner
      }
    }
    return this.http
      .get(req.url, {
        observe: 'response',
        headers: headers,
        params: req.qParams,
        responseType: 'blob' as 'json',
      })
      .pipe(
        map((res: any) => {
          const content_disposition = res.headers.get('Content-Disposition');
          const extract = content_disposition.toString().split(';')[1];
          const filename = extract
            .split('=')[1]
            .trim()
            .replace(/(^"|"$)/g, '');
          const blob = new Blob([res.body], {
            type: 'application/octet-stream',
          });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64 = reader.result;
            const source = base64!.toString();
            let link: any = document.createElement('a');
            link.id = 'pdfLink' + filename;
            link.href = source;
            link.target = '_blank';
            link.download = filename.toString();
            link.click();
            link = null;
          };
        })
      );
  }

  // todoAPIInvoice(id, fileInput, body) {
  //   const formData = new FormData();
  //   formData.append('invoice_photo', fileInput.files[0]);
  //   formData.append('supplier_name', body.supplier_name);
  //   formData.append('purchase_date', body.purchase_date);

  //   this.http.put(`/api/purchasing/${id}`, formData).subscribe({
  //     next: res => console.log('Success:', res),
  //     error: err => console.error(err)
  //   });
  // }
}
