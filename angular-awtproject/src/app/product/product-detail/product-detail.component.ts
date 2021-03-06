import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Product } from '../product.model';
import { ProductService } from '../product.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/auth/auth.service';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product;
  isLoading = false;
  userId: string;
  userIsAuth;
  private authSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private matDialog: MatDialog
  ) {}

  ngOnInit() {
    this.authSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuth => {
        this.userId = this.authService.getUserId();
        this.userIsAuth = isAuth;
      });
    this.userId = this.authService.getUserId();
    this.userIsAuth = this.authService.getisAuthenticated();
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('id')) {
        this.isLoading = true;
        this.productService.getProduct(paramMap.get('id')).subscribe(
          result => {
            this.isLoading = false;
            this.product = {
              _id: result.product._id,
              title: result.product.title,
              content: result.product.content,
              category: result.product.category,
              price: result.product.price,
              image: result.product.image,
              userId: {
                name: result.product.creator.name,
                surname: result.product.creator.surname,
                _id: result.product.creator._id
              }
            };
          },
          error => {
            this.isLoading = false;
            this.snackBar.open(error.error.message, '', {
              duration: 2000
            });
            this.router.navigate(['/']);
          }
        );
      }
    });
  }

  onDelete() {
    const dialog = this.matDialog.open(DialogComponent);
    dialog.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.productService.deleteProduct(this.product._id).subscribe(
          result => {
            this.snackBar.open(result.message, '', {
              duration: 2000
            });
            this.router.navigate(['/']);
          },
          error => {
            this.snackBar.open(error.error.message, '', {
              duration: 2000
            });
          }
        );
      }
    });
  }

  onAddToCart() {
    this.authService.addToCart(this.product._id);
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
