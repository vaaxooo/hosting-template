$(document).ready(function() {
    $(".mnav").slideAndSwipe();
    $("body").removeClass("preload");
    $("[rel='tooltip']").tooltip();
    $("#date").mask("99.99.9999", {placeholder: "дд.мм.гггг" });
    $("select:not(.mobile-pills)").styler();
    sticky();
    add_phone();
    del_phone();
    delete_error();
    card_type();
    update_payout_form();

    $(window).on("load resize", function() {
      scrolly();
      sticky();
      update_chat();
    }); 

    $(".l-menu-footer, .ico-close-menu").on("click", function() {
        $(".size-footer").fadeToggle("normal");
    });

    $(".modal").live("show.bs.modal", function () {
      $(".modal-close").removeClass("hidden");  
    });

    $(".modal").live("hide.bs.modal", function () {
      $(".modal-close").addClass("hidden");  
    });

    $(".panel-projects .add").live("click", function() {
        $(".new-project").modal("show");
    });

    $(".new-project .btn-default[data-action=close]").live("click", function() {
        $(".new-project").modal("hide");
    });

    $(".new-project .btn-primary[data-action=add]").live("click", function() {
      var error = false,
          url_scheme = $(".new-project select[name=url_scheme]").val(),
          domain = $(".new-project input[name=domain]").val(),
          desc = $(".new-project textarea[name=desc]").val(),
          hash = $(".new-project input[name=hash]").val(),
          regex = new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)([\-]{0,4})\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.([a-zA-Z0-9-]{2,10})$/);
    
      if (!regex.test(domain)) {
        $(".new-project input[name=domain]").addClass("error");
        error = true;
      }

      if(desc.length < 10) {
        $(".new-project textarea[name=desc]").addClass("error");
        error = true;
      }

      if(!error){
        $(".new-project .btn-primary[data-action=add]").addClass("disabled").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
        setTimeout(function() {
          $.ajax({
            url: "/panel/main",
            type: "POST",
            data: {
              action: "add",
              url_scheme: url_scheme,
              domain: domain,
              desc: desc,
              hash: hash
            },
            cache: !1,
            dataType: "json",
            success: function(c) {
              if(c.error){
                note({
                  content: c.error,
                  type: "error",
                  time: 5
                });
                $(".new-project .btn-primary[data-action=add]").removeClass("disabled").prop("disabled", false).html("Добавить");
              }else if(c.success){
                $(".new-project .add").hide();
                $(".new-project .confirm").html(c.success).fadeIn("100");  
                $(".new-project .btn-default[data-action=close]").attr("data-action", "back").html("Назад");
                $(".new-project .btn-primary[data-action=add]").removeClass("disabled").prop("disabled", false).attr("data-action", "confirm").attr("data-type", "txt").html("Подтвердить");      
              }             
            },
            error: function() {
              note({
                content: "Ошибка соединения с сервером",
                type: "error",
                time: 5
              });
              $(".new-project .btn-primary[data-action=add]").removeClass("disabled").prop("disabled", false).html("Добавить");
            }
          })
        }, 700);
      }
    });

    $(".new-project .btn-default[data-action=back]").live("click", function() {
      $(".new-project .confirm").hide().html("");
      $(".new-project .add").fadeIn("100");
      $(".new-project .btn-default[data-action=back]").attr("data-action", "close").html("Закрыть");
      $(".new-project .btn-primary[data-action=confirm]").attr("data-action", "add").removeAttr("data-type").html("Добавить");
    });

    $(".new-project .btn-primary[data-action=confirm]").live("click", function() {
      var type = $(this).attr("data-type");
          hash = $(".new-project input[name=hash]").val();
      $(".new-project .btn-primary[data-action=confirm]").addClass("disabled").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
      setTimeout(function() {
        $.ajax({
          url: "/panel/main",
          type: "POST",
          data: {
            action: "confirm",
            type: type,
            hash: hash
          },
          cache: !1,
          dataType: "json",
          success: function(c) {
            if(c.error){
              note({
                content: c.error,
                type: "error",
                time: 5
              });
              $(".new-project .btn-primary[data-action=confirm]").removeClass("disabled").prop("disabled", false).html("Подтвердить");
            }else if(c.success){
              window.location.replace("/panel/main") 
            }             
          },
          error: function() {
            note({
              content: "Ошибка соединения с сервером",
              type: "error",
              time: 5
            });
            $(".new-project .btn-primary[data-action=confirm]").removeClass("disabled").prop("disabled", false).html("Подтвердить");
          }
        })
      }, 700);
    });

    $(".new-project .btn-group button").live("click", function() {
      $(".new-project .btn-group button").prop("disabled", false);
      $(".confirm .info div").hide();
      $(this).prop("disabled", true);
      $(".confirm .info #"+$(this).data("type")).show();
      $(".confirm .info input[name=check]").val($(this).data("type"));
      $(".new-project .btn-primary").attr("data-type", $(this).data("type"));
    });

    $(".valid-num").live("input paste", function() {
      if(this.value != this.value.replace(/[^0-9]/g, "")) this.value = this.value.replace(/[^0-9]/g, "");
    });

    $(".valid-sum").live("input paste", function() {
      if(this.value != this.value.replace(/[^0-9.]/g, "").replace(/[^.\d]+/g,"").replace( /^([^\.]*\.)|\./g, "$1" ).substring(0, 8)){
        this.value = this.value.replace(/[^0-9.]/g, "").replace(/[^.\d]+/g,"").replace( /^([^\.]*\.)|\./g, "$1" ).substring(0, 8);
      }

      if(this.value.indexOf('.') != -1){
        if((this.value.length-this.value.indexOf('.')) > 3){
          this.value = this.value.substring(0, this.value.indexOf('.') + 3);
        }
      }
    });

    $(".panel-transactions i").on("click", function(){
      var hash = $(".new-project input[name=hash]").val();
      $(".last-trans-scroll").getNiceScroll().hide();
      $(".last-transactions").css("opacity", "0.5");
      setTimeout(function() {
        $.ajax({
            url: "/panel/main",
            type: "POST",
            data: {
                reload: hash
            },
            cache: !1,
            success: function(a) {
              $(".last-transactions tbody").html(a); 
              $(".last-transactions").css("opacity", "1");
              $(".last-trans-scroll").getNiceScroll().show().resize();
            }
        })
      }, 300);
    });

    $(".filter-line").on("sticky-start", function() { 
      setTimeout(function() { 
        $(".table-responsive").removeClass("unsticky"); 
      }, 1); 
    });

    $(".filter-line").on("sticky-end", function() { 
      setTimeout(function() { 
        $(".table-responsive").addClass("unsticky"); 
      }, 1); 
    });

    $(".valid-wallet").focus(function() {
        if(this.value.length == 0) this.value = "Z" + this.value;
    });

    $(".valid-wallet").on("input paste", function() {
        this.value = this.value.replace(/[^0-9]/g, "").toUpperCase();
        this.value = "Z" + this.value;
    });

    $(".payout-header-mass span").on("click", function() {
        var check = $(".payout-header input[name='payout-toggle']");
        check.prop("checked", !check.prop("checked"));
    });

    $(".payout-header-mass span, input[name='payout-toggle']").on("click", function() {
        if($(".payout-header input[name='payout-toggle']").prop("checked")){
          $(".payout-form").hide("normal");
          setTimeout(function() {
            $(".masspayout-form").addClass("active").fadeIn("400");
            setTimeout(function() { $(".masspay-list-block").getNiceScroll().show().resize(); }, 300);
          }, 150);

        }else{
          $(".payout-form").show("normal");
          setTimeout(function() {
            $(".masspay-list-block").getNiceScroll().hide();
            $(".masspayout-form").hide();
          }, 50);
        }
      });

    $(".payout-form select[name='method']").on("change", function(e) {
      update_payout_form();
      e.preventDefault();
      $(".payout-form select[name='method']").trigger("refresh");
      $(".payout-form input[name='amount']").removeClass("error");
      update_payout_amount("amount");
    }); 

    $(".commission .payer").on("click", function() {
      $(".commission .payer").removeClass("selected");
      $(this).addClass("selected");
      $.ajax({
          url: "/panel/payout",
          type: "POST",
          data: {
            commission: $(this).data("type"),
            hash: $(".payout-form input[name='payout_hash']").val(),
          },
          cache: !1,
          dataType: "json"
      });
      $(".payout-form input[name='amount']").removeClass("error");
      update_payout_amount("amount");
    });

    $(".payout-form input").on("input", function() {
      update_payout_amount($(this).attr("name"));
    });

    $(".payout-form form").on("submit", function() {
      var error = false;
      var sum = $(".payout-form input[name=amount]").val();
      if(sum < 0.01) {
        $(".payout-form input[name=amount]").addClass("error");
        error = true;
      }
      if(!error && !$(".payout-form input[name=amount]").hasClass("error")){
        $(".payout-form .btn").addClass("disabled").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>")
        setTimeout(function() {
            $.ajax({
                type: "POST",
                url: "/panel/payout",
                data: $(".payout-form form").serialize(),
                cache: !1,
                dataType: "json",
                success: function(c) {
                  if(c.error){
                    note({
                      content: c.error,
                      type: "error",
                      time: 5
                    });
                    if(c.code == '1'){
                      $(".payout-form input[name=amount]").addClass("error");
                    }else{
                      $(".payout-form input[name=amount]").removeClass("error");
                    }
                  }else if(c.success){
                    note({
                      content: c.success,
                      type: "success",
                      time: 5
                    });
                    count = 10;
                    update_balance();
                    update_payout_list();
                  }
                  $(".payout-form .btn").removeClass("disabled").prop("disabled", false).html("Отправить<span></span>");
                  update_payout_amount("amount");
                },
                error: function() {
                    note({
                        content: "Ошибка соединения с сервером",
                        type: "error",
                        time: 5
                    });
                    $(".payout-form .btn").removeClass("disabled").prop("disabled", false).html("Отправить<span></span>");
                    update_payout_amount("amount");
                }
            })
        }, 700)
      }
      return false;
    });

    $(".masspay-control .add-payment").on("click", function(){
      var error = false;
      if(count > 100){
        note({
            content: "Превышен лимит выплат",
            type: "error",
            time: 5
        });
        error = true;
      }

      if(!error){
        var qiwi_active = $(".payout-form select[name='method'] option[value=qiwi]").prop("disabled") ? "disabled" : "";
            wm_active = $(".payout-form select[name='method'] option[value=wm]").prop("disabled") ? "disabled" : "";
            ym_active = $(".payout-form select[name='method'] option[value=ym]").prop("disabled") ? "disabled" : "";
            mp_active = $(".payout-form select[name='method'] option[value=mp]").prop("disabled") ? "disabled" : "";
            card_active = $(".payout-form select[name='method'] option[value=card]").prop("disabled") ? "disabled" : "";
            card_uah_active = $(".payout-form select[name='method'] option[value='card_uah']").prop("disabled") ? "disabled" : "";

        $(".masspay-list-block").append('<div class="masspay-block"> \
           <div class="column"><input type="text"  name="account_number[]"  class="form-control" placeholder="Номер счета" autocomplete="off"> </div> \
          <div class="column"><input type="text"  name="amount[]"  class="form-control valid-sum" placeholder="Сумма" step="0.01" autocomplete="off"> </div> \
          <div class="column"><select name="method[]" class="form-control"> \
          <option value="qiwi" '+ qiwi_active +'>Qiwi Wallet</option> \
          <option value="wm" '+ wm_active +'>Webmoney</option> \
          <option value="card" '+ card_active +'>Банк. карта RUB</option> \
          <option value="card_uah" '+ card_uah_active +'>Банк. карта UAH</option> \
          <option value="mp" '+ mp_active +'>Моб. телефон</option> \
          <option value="ym" '+ ym_active +'>Яндекс.Деньги</option></select></div> \
          <div class="column"><i class="delete"></i></div> \
          <input type="hidden" name="payout[]" value="1">  \
          </div>');

        count = +count + 1;
        if(count >= 1){
          $(".masspay-block .delete").css("display", "block");
        }

        if($(".masspay-list-block").height() >= ($(window).height() - 307)){
          $(".masspay-list-block").addClass("scroll");
          $(".masspay-list-block").getNiceScroll().show().resize();
          $(".masspay-list-block").scrollTop($(".masspay-list-block").prop("scrollHeight"));
        }else{
          $(".masspay-list-block").removeClass("scroll");
          $(".masspay-list-block").getNiceScroll().hide();
        }

        setTimeout(function(){ 
          $(".masspay-block select").styler({
            onSelectOpened: function() {
              $(".masspay-list-block").getNiceScroll().resize();
            },
            onSelectClosed: function() {
              $(".masspay-list-block").getNiceScroll().resize();
            }
          }); 
        }, 1);
      }
    });

    $(".masspay-block select[name='method[]']").live("change", function() {
      $(this).closest(".masspay-block").find("input[name='account_number[]']").removeClass("error");
      $(this).closest(".masspay-block").find("input[name='amount[]']").removeClass("error");
    });

    $(".masspay-block .delete").live("click", function() {
      count = +count - 1; 
      if(count < 1){ 
        $(".masspay-block .delete").hide(); 
      }
      
      $(this).parent().parent().remove(); 
      if($(".masspay-list-block").height() >= ($(window).height() - 307)){
        $(".masspay-list-block").addClass("scroll");
        $(".masspay-list-block").getNiceScroll().show().resize();
      }else{
        $(".masspay-list-block").removeClass("scroll");
        $(".masspay-list-block").getNiceScroll().hide();
      }

      return false;
    });

    $(".masspayout-form form").on("submit", function() {
      var error = false;
      $(".masspayout-form input[name='account_number[]']").each(function(){
        var method = $(this).closest(".masspay-block").find("select[name='method[]']").val();
        if(method == "qiwi"){
          var regex = new RegExp("^(992|91|7|380|77|44|995|998|37|66|507|90|84|82|996|1|66|81|994|972)[0-9]{8,11}$");
        }else if(method == "wm"){
          var regex = new RegExp("^Z([0-9]{10,14})$");
        }else if(method == "card"){
          var regex = new RegExp("^[0-9]{16,19}$");
        }else if(method == "card_uah"){
          var regex = new RegExp("^[0-9]{16}$");
        }else if(method == "ym"){
          var regex = new RegExp("^41001([0-9]{8,12})$");
        }else if(method == "mp"){
          var regex = new RegExp("^79([0-9]{9})$");
        }

        if (!regex.test($(this).val().trim())){
          error = true;
          $(this).addClass("error");    
        }
      });      

      $(".masspayout-form input[name='amount[]']").each(function(){
        var sum = $(this).val();
        if(sum < 0.01){
          error = true;
          $(this).addClass("error");    
        }
      });
    
      if(!error && !$(".masspayout-form input[name='account_number[]']").hasClass("error") && !$(".masspayout-form input[name='amount[]']").hasClass("error")){
        $(".masspayout-form .btn-primary").addClass("disabled").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
        setTimeout(function() {
          $.ajax({
            type: "POST",
            url: "/panel/payout",
            data: $(".masspayout-form form").serialize(),
            dataType: "json",
            success: function(c) {
              if(c.error){
                note({
                    content: c.error,
                    type: "error",
                    time: 5
                });
                if(c.code == "1"){
                  $(".masspay-block:eq("+ c.id +") input[name='amount[]']").addClass("error");
                }else if(c.code == "2"){
                  $(".masspay-block:eq("+ c.id +") input[name='account_number[]']").addClass("error");
                }
              }else if(c.success){
                note({
                    content: c.success,
                    type: "success",
                    time: 5
                });
                update_balance();
                update_payout_list();
                setTimeout(function() {
                  $(".payout-form").show("normal");
                  setTimeout(function() {
                    $(".masspay-list-block").getNiceScroll().hide();
                    $(".masspay-list-block").removeClass("scroll");
                    $(".masspayout-form").hide();
                    $(".payout-header input[name='payout-toggle']").prop("checked", 0);
                  }, 50);
                  setTimeout(function() {
                    count = 0;
                    var qiwi_active = $(".payout-form select[name='method'] option[value=qiwi]").prop("disabled") ? "disabled" : "";
                      wm_active = $(".payout-form select[name='method'] option[value=wm]").prop("disabled") ? "disabled" : "";
                      ym_active = $(".payout-form select[name='method'] option[value=ym]").prop("disabled") ? "disabled" : "";
                      mp_active = $(".payout-form select[name='method'] option[value=mp]").prop("disabled") ? "disabled" : "";
                      card_active = $(".payout-form select[name='method'] option[value=card]").prop("disabled") ? "disabled" : "";
                      card_uah_active = $(".payout-form select[name='method'] option[value='card_uah']").prop("disabled") ? "disabled" : "";

                    $(".masspay-list-block").html('<div class="masspay-block"> \
                      <div class="column"><input type="text"  name="account_number[]"  class="form-control" placeholder="Номер счета" autocomplete="off"> </div> \
                      <div class="column"><input type="text"  name="amount[]"  class="form-control valid-sum" placeholder="Сумма" step="0.01" autocomplete="off"> </div> \
                      <div class="column"><select name="method[]" class="form-control"> \
                      <option value="qiwi" '+ qiwi_active +'>Qiwi Wallet</option> \
                      <option value="wm" '+ wm_active +'>Webmoney</option> \
                      <option value="card" '+ card_active +'>Банк. карта RUB</option> \
                      <option value="card_uah" '+ card_uah_active +'>Банк. карта UAH</option> \
                      <option value="mp" '+ mp_active +'>Моб. телефон</option> \
                      <option value="ym" '+ ym_active +'>Яндекс.Деньги</option></select></div> \
                      <div class="column"><i class="delete"></i></div> \
                      <input type="hidden" name="payout[]" value="1">  \
                      </div>');
                    setTimeout(function() {
                      $("select").styler();
                    }, 1);
                  }, 300); 
                }, 300);                
              }
              $(".masspayout-form .btn-primary").removeClass("disabled").prop("disabled", false).html("Отправить");
            },
            error: function() {
                note({
                    content: "Ошибка соединения с сервером",
                    type: "error",
                    time: 5
                });
                $(".masspayout-form .btn-primary").removeClass("disabled").prop("disabled", false).html("Отправить");
            }
          })
        }, 700);
      }
      return false;
    });

    $(".payout-list-box select[name='status']").on("change", function() {
        list = 10;
        update_payout_list();
    }); 

    $(".payout-list-box input[name='from']").on("dp.change", function (e) {
      $(".payout-list-box input[name='to']").data("DateTimePicker").setMinDate(e.date);
      list = 10;
      update_payout_list();
      $(".payout-list-box input[name='to']").focus().click();
    });

    $(".payout-list-box input[name='from']").on("dp.hide", function (e) {
      this.blur();
    });

    $(".payout-list-box input[name='to']").on("dp.change", function (e) {
      $(".payout-list-box input[name='from']").data("DateTimePicker").setMaxDate(e.date);
      list = 10;
      update_payout_list();
    }); 

    $(".payout-list-box input[name='to']").on("dp.hide", function (e) {
      this.blur();
    }); 

    $(".payout-list-box input[name='search']").on('input paste', function() {
      list = 10;
      update_payout_list();
    });

    $(".load-payouts").live("click", function() {
      list += 10;
      update_payout_list(list);
    });  

    $(".payout-filter-export").on("click", function() {
      var hash = $(".payout-form input[name='payout_hash']").val(),
          status = status ? status : $(".payout-list-box select[name='status']").val(),
          from = $(".payout-list-box input[name='from']").val(),
          to = $(".payout-list-box input[name='to']").val(), 
          search = $(".payout-list-box input[name='search']").val();
      $(".payout-filter-export").addClass("loading").html("<div class=\"preloader-wrapper small active\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
      setTimeout(function() {
            $.ajax({
            url: "/panel/payout",
            type: "POST",
            data: {
                action: "export",
                status: status,
                from: from,
                to: to,
                search: search,                
                list_hash: hash
            },
            cache: !1,
            dataType: "json",
            success: function(c) {
              if(c.error){
                note({
                  content: c.error,
                  type: "error",
                  time: 5
                });                
              }else if(c.success){
                var a = $("<a>");
                a.attr("href", c.success);
                $("body").append(a);
                a.attr("download","anypay_payouts_"+from+"-"+to+".xlsx");
                a[0].click();
                a.remove();
              }
              $(".payout-filter-export").removeClass("loading").html("");
            },
            error: function() {
                note({
                    content: "Ошибка соединения с сервером",
                    type: "error",
                    time: 5
                });
                $(".payout-filter-export").removeClass("loading").html("");
            }
        });
      }, 500);
    });

    $(".masspay-block .wallet, .masspay-block .amount, .payinp .sum, .form-group input, .support-content .form-control, .ticket-textarea, .form-control").focus(function() {
        $(this).removeClass("error");
    });

    $(".form-control.token").focus(function() {
        $(this).select();
    });

    $(".checkin input[type=checkbox]").change(function() {
        if(this.checked) {
          $(this).parent().parent().addClass("active");
        }else{
          $(this).parent().parent().removeClass("active");
        }
    }); 

    $(".payment-filter select[name=status], .payment-filter select[name='method']").on("change", function() {
      list = 25;
      update_payment_list($(".payment-filter input[name='hash']").data("project"));
    }); 

    $(".payment-filter input[name=from]").on("dp.change", function (e) {
      $(".payment-filter input[name=to]").data("DateTimePicker").setMinDate(e.date);
      list = 25;
      update_payment_list($(".payment-filter input[name='hash']").data("project"));
      $(".payment-filter input[name=to]").focus().click();
    });

    $(".payment-filter input[name=from]").on("dp.hide", function (e) {
      this.blur();
    });

    $(".payment-filter input[name=to]").on("dp.change", function (e) {
      $(".payment-filter input[name=from]").data("DateTimePicker").setMaxDate(e.date);
      list = 25;
      update_payment_list($(".payment-filter input[name='hash']").data("project"));
    }); 

    $(".payment-filter input[name=to]").on("dp.hide", function (e) {
      this.blur();
    }); 

    $(".payment-filter input[name=search]").on('input paste', function() {
      list = 25;
      update_payment_list($(".payment-filter input[name='hash']").data("project"));
    });

    $(".load-payments").live("click", function() {
      list += 25;
      update_payment_list($(".payment-filter input[name=hash]").data("project"), list);
    });  

    $(".payment-filter select[name=method]").styler("destroy").styler({
      selectSearch: "true",
      onSelectOpened: function() {
        $(".jq-selectbox__search input").focus();
      }
    });

    $(".payment-filter-line").on("sticky-start", function() { 
      $(".payment-filter input[name='from'], .payment-filter input[name='to']").blur(); 
    });

    $(".payment-filter-line").on("sticky-end", function() { 
      $(".payment-filter input[name='from'], .payment-filter input[name='to']").blur(); 
    });

    $(".payment-filter-export").on("click", function() {
      var hash = $(".payment-filter input[name='hash']").val(),
          project = $(".payment-filter input[name='hash']").data("project"),
          status = $(".payment-filter select[name='status']").val(),
          method = $(".payment-filter select[name='method']").val(),
          from = $(".payment-filter input[name='from']").val(),
          to = $(".payment-filter input[name='to']").val(),
          search = $(".payment-filter input[name='search']").val();
      $(".payment-filter-export").addClass("loading").html("<div class=\"preloader-wrapper small active\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
      setTimeout(function() {
        $.ajax({
          url: "/panel/project/"+ project,
          type: "POST",
          data: {
            act: "stat",
            action: "export",
            status: status,
            method: method,
            from: from,
            to: to,
            search: search,
            hash: hash
          },
          cache: !1,
          dataType: "json",
          success: function(c) {
            if(c.error){
              note({
                content: c.error,
                type: "error",
                time: 5
              });                
            }else if(c.success){
              var a = $("<a>");
              a.attr("href", c.success);
              $("body").append(a);
              a.attr("download","anypay_payments_"+project+"_"+from+"-"+to+".xlsx");
              a[0].click();
              a.remove();
            }
            $(".payment-filter-export").removeClass("loading").html("");
          },
          error: function() {
            note({
              content: "Ошибка соединения с сервером",
              type: "error",
              time: 5
            });
            $(".payment-filter-export").removeClass("loading").html("");
           }
        });
      }, 500);
    });

    $(".payment-table tbody tr").live("click", function() {
      var hash = $(".payment-filter input[name='hash']").val(),
          project = $(".payment-filter input[name='hash']").data("project"),
          payment = $(this).data("id");    
      $.ajax({
        type: "POST",
        url: "/panel/project/"+ project,
        data: {
          act: "stat",
          action: "info",
          payment: payment,
          hash: hash
        },
        success: function(e) {
          $(".payment-info-result").html(e);
          $(".modal-backdrop").remove();
          $(".modal-info").modal("show");
          $("select").styler();
        },
        error: function() {
          note({
            content: "Ошибка соединения с сервером",
            type: "error",
            time: 5
          });
        }
      })
    });

    $(".modal-info .selector select").live("change", function() {
      $(".modal-info .modal-body .section").hide();
      $(".modal-info .modal-body #"+$(this).val()).show();
    });    

    $(".modal-info .resend").live("click", function() {
      var hash = $(".payment-filter input[name='hash']").val(),
          project = $(".payment-filter input[name='hash']").data("project"),
          payment = $(this).data("id");  
      $(this).addClass("disabled").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");  
      setTimeout(function() {  
        $.ajax({
          type: "POST",
          url: "/panel/project/"+ project,
          data: {
            act: "stat",
            action: "resend",
            payment: payment,
            hash: hash
          },
          success: function(e) {
            $(".modal-info .resend").removeClass("disabled").prop("disabled", false).html("Отправить оповещение");
            alert(e);
          },
          error: function() {
            note({
                content: "Ошибка соединения с сервером",
                type: "error",
                time: 5
            });
            $(".modal-info .resend").removeClass("disabled").prop("disabled", false).html("Отправить оповещение");
          }
        })
      }, 300);
    });

    $(".testing-box .btn-primary").on("click", function() {
      var error = false,
          hash = $(".testing-box input[name='hash']").val(),
          project = $(".testing-box input[name='hash']").data("project"),
          pay_id = $(".testing-box input[name='pay_id']").val(),
          amount = $(".testing-box input[name='amount']").val(),
          currency = $(".testing-box select[name='currency']").val(),
          email = $(".testing-box input[name='email']").val(),
          field1 = $(".testing-box input[name='field1']").val(),
          field2 = $(".testing-box input[name='field2']").val(),
          field3 = $(".testing-box input[name='field3']").val(),
          field4 = $(".testing-box input[name='field4']").val(),
          field5 = $(".testing-box input[name='field5']").val(),
          result_method = $(".testing-box select[name='result_method']").val(),
          regex = new RegExp(/^[a-z0-9._-]+@[a-z0-9-]+\.[a-z]{2,6}$/i);
          
      if(pay_id.length < 1) {
        $(".testing-box input[name=pay_id]").addClass("error");
        error = true;
      }
      if(amount.length < 1) {
        $(".testing-box input[name=amount]").addClass("error");
        error = true;
      }
      if(!regex.test(email)) {
        $(".testing-box input[name='email']").addClass("error");
        error = true;
      }

      if(!error){
        $(this).addClass("disabled").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
        setTimeout(function() {
          $.ajax({
            type: "POST",
            url: "/panel/project/"+ project,
            data: {
              act: "testing",
              pay_id: pay_id,
              amount: amount,
              currency: currency,
              email: email,
              field1: field1,
              field2: field2,
              field3: field3,
              field4: field4,
              field5: field5,
              result_method: result_method,
              hash: hash
            },
            cache: !1,
            dataType: "json",
            success: function(c) {
              if(c.error){
                note({
                  content: c.error,
                  type: "error",
                  time: 5
                }); 
                $(".testing-box .btn-primary").removeClass("disabled").prop("disabled", false).html("\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c");               
              }else if(c.success){
                $(".testing-result").html(c.success);
                $(".testing-box .btn-primary").removeClass("disabled").prop("disabled", false).html("\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c");
              }
            },
            error: function() {
              note({
                content: "Ошибка соединения с сервером",
                type: "error",
                time: 5
              });
              $(".testing-box .btn-primary").removeClass("disabled").prop("disabled", false).html("\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c");
            }
          })
        }, 300)
      }
    });

    $(".create-form").on("click", function() {
       create_form($(this).data("merchant"));
    });

    $(".create-button").on("click", function() {
      create_button($(this).data("merchant"));
    });

    $(".create-qr-code").on("click", function() {
      create_qrcode($(this).data("merchant"));
    });

    $(".create-link").on("click", function() {
      create_link($(this).data("merchant"));
    });

    $(".widget-form input").on("input paste", function() {
      update_form();
    });

    $(".button-form input").on("input paste", function() {
      update_button();
    });

    $(".link-form input").on("input paste", function() {
      update_link();
    });

    $(".create-sup").on("submit", function() {
      let haserrors = false;
      $(".create-sup input, .create-sup textarea").each(function(){
        if($(this).val().trim().length < 3) {
           haserrors = true;
          $(this).addClass('error');    
        } 
      });

      if(!haserrors){
        $(".create-sup .btn-primary").addClass("disabled").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
        setTimeout(function() {
          $.ajax({
            type: "POST",
            url: "/panel/support",
            data: $(".create-sup").serialize(),
            cache: !1,
            dataType: "json",
            success: function(c) {
              if(c.error){
                note({
                  content: c.error,
                  type: "error",
                  time: 5
                });
                $(".create-sup .btn-primary").removeClass("disabled").prop("disabled", false).html("\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c");
              }else if(c.success){
                window.location.replace("/panel/ticket/"+ c.success)
              }
            },
            error: function() {
              note({
                content: "Ошибка соединения с сервером",
                type: "error",
                time: 5
              });
              $(".create-sup .btn-primary").removeClass("disabled").prop("disabled", false).html("\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c");
            }
          })
        }, 500)
      }
      return false;
    });

    $(".ticket-send .attach").on("click", function() {
      var ticket = $(".ticket-send-box form input[name=ticket]").val(),
          hash = $(".ticket-send-box form input[name=hash]").val();
      $(".ticket-uploud-img").click();
      $("input[type=file]").one('change', function(b) {
        files = this.files;
        b.stopPropagation();
        b.preventDefault();
        var e = new FormData;
        $.each(files, function(a, c) {
            5 > count ? e.append(a, c) : note({content: "\u041c\u043e\u0436\u043d\u043e \u043f\u0440\u0438\u043a\u0440\u0435\u043f\u0438\u0442\u044c \u043d\u0435 \u0431\u043e\u043b\u0435\u0435 5 \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0439",type: "error",time: 5})
        });
        $.ajax({
            url: "/panel/ticket/"+ ticket +"?upload="+ hash,
            type: "POST",
            data: e,
            cache: !1,
            dataType: "json",
            processData: !1,
            contentType: !1,
            success: function(a, c, b) {
                if ("undefined" === typeof a.error) {
                    var d = "";
                    $.each(a.files, function(a, b) {
                        d = b;
                        var c = Math.floor(100 * Math.random()) + 1;
                        count = +count + 1;
                        $(".ticket-img-input").append("<input type='hidden' name='images[]' id='img" + c + "' value='" + d + "'>");
                        $(".ticket-img-box").append("<div class='img'><i onclick='$(this).parent().remove(); $(\"#img" + c + "\").remove(); count = count - 1; update_chat()'></i><a href='../" + d + "' target='_blank'><div style='background: url(../"+ d + ") no-repeat 50% 0;'></div></a></div>")
                    });
                    update_chat();
                }else{
                    note({
                      content: a.error,
                      type: "error",
                      time: 5
                    });
                }
            },
            error: function() {
                    note({
                      content: "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435",
                      type: "error",
                      time: 5
                    });
            }
        })
      });
    });

    $(".ticket-send textarea").on("input paste", function() {
      $(this).outerHeight(50).outerHeight(this.scrollHeight);
      if(this.value.trim().length > 0){
        $(".ticket-send .send").addClass("active");
      }else{
        $(".ticket-send .send").removeClass("active");
      }
      update_chat();
    });

    $(".ticket-send-box form").on("submit", function() {
      $.ajax({
            type: "POST",
            url: "/panel/ticket",
            data: $(".ticket-send-box form").serialize(),
            cache: !1,
            dataType: "json",
            success: function(c) {
              if(c.error){
                note({
                  content: c.error,
                  type: "error",
                  time: 5
                });
              }else if(c.success){
                $(".ticket-history").html(c.success);
                $(".ticket-send textarea").val("").outerHeight(50).outerHeight($(".ticket-send textarea").scrollHeight).focus();
                $(".ticket-send .send").removeClass("active");
                $(".ticket-img-box, .ticket-img-input").html("");
                update_chat();
              }
            },
            error: function() {
              note({
                content: "Ошибка соединения с сервером",
                type: "error",
                time: 5
              });
            }
      })
      return false;
    });

    $(".ticket-send .send").on("click", function() {
      $(".ticket-send-box form").submit();
    });
});

var panel_chart_options = {
  series: [],
  labels: [],
  chart: {
    height: 200, 
    width: (window.innerWidth > 991) ? "103%" : "100%",
    type: "area",
    fontFamily: "Proxima Nova",
    zoom: {
      enabled: false
    },
    toolbar: {
      show: false
    },
    animations: {
      enabled: false
    },
    parentHeightOffset: 0,
    redrawOnWindowResize: true,
    redrawOnParentResize: true
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: 3,
    curve: "straight"
  },
  colors: ["#7e5ba8", "#e9e9e9ff"],
  fill: {       
    colors: ["#7e5ba8", "#e9e9e9ff"],       
    type: "gradient",       
    gradient: {         
      shadeIntensity: 1,         
      opacityFrom: 0.5,         
      opacityTo: 0.4,         
      stops: [0, 100],         
      gradientToColors: ["#f6f6f6"],       
    }     
  },
  grid: {
    show: true,
    borderColor: "#ececefab",
    xaxis: {
      lines: {
        show: false
      }
    },   
    yaxis: {
      lines: {
        show: true
      }
    }
  },
  tooltip: {
    enabled: true,
    followCursor: false,
    marker: {
      show: false,
    },
    y: {
      formatter: function (val) {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(".00", "")
      }
    }
  },
  xaxis: {
    opposite: false,
    tickPlacement: "on",
    tooltip: {
      enabled: false,
    },
    labels: {
      hideOverlappingLabels: false,
      rotate: 0,
      maxHeight: 20,
      offsetY: -3,
      style: {
        colors: "#828287",
        fontSize: (window.innerWidth > 767) ? "13px" : "12px",
        fontWeight: 400,
      }
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    crosshairs: {
      stroke: {
        color: "#d6d6d6",
      },
    },
  },
  yaxis: [{
    labels: {
      maxWidth: 15,
      offsetX: 9,
      style: {
        colors: "#828287",
        fontSize: (window.innerWidth > 767) ? "13px" : "12px",
        fontWeight: 400,
      },
      formatter: function (val) {
        return Math.round(val)
      }
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },      
  }, 
  {
    show: false, 
    min: 1, 
    max: 1,
    labels: {
      maxWidth: 15,
      offsetX: 9,
      style: {
        colors: "#828287",
        fontSize: (window.innerWidth > 767) ? "13px" : "12px",
        fontWeight: 400,
      },
      formatter: function (val) {
        return Math.round(val)
      }
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  }],
  plotOptions: {
    bar: {
      columnWidth: "0%"
    }
  },
  legend: {
    show: false,
  },
  markers: {
    strokeColors: "#fff",
    hover: {
      size: 4
    }
  },
};

var payment_chart_options = {
  series: [],
  labels: [],
  chart: {
    height: (window.innerWidth > 767) ? 300 : 250, 
    width: "100%",
    type: "area",
    fontFamily: "Proxima Nova",
    zoom: {
      enabled: false
    },
    toolbar: {
      show: false
    },
    animations: {
      enabled: false
    },
    parentHeightOffset: 0,
    redrawOnWindowResize: true,
    redrawOnParentResize: true
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: 3,
    curve: "straight"
  },
  colors: ["#7e5ba8", "#e9e9e9ff"],
  fill: {       
    colors: ["#7e5ba8", "#e9e9e9ff"],       
    type: "gradient",       
    gradient: {         
      shadeIntensity: 1,         
      opacityFrom: 0.5,         
      opacityTo: 0.4,         
      stops: [0, 100],         
      gradientToColors: ["#f6f6f6"],       
    }     
  },
  grid: {
    show: true,
    borderColor: "#ececefab",
    xaxis: {
      lines: {
        show: false
      }
    },   
    yaxis: {
      lines: {
        show: true
      }
    }
  },
  tooltip: {
    enabled: true,
    followCursor: false,
    marker: {
      show: false,
    },
    y: {
      formatter: function (val) {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(".00", "")
      }
    }
  },
  xaxis: {
    opposite: false,
    tickPlacement: "on",
    tooltip: {
      enabled: false,
    },
    labels: {
      hideOverlappingLabels: false,
      rotate: 0,
      maxHeight: 20,
      offsetY: -3,
      style: {
        colors: "#828287",
        fontSize: (window.innerWidth > 767) ? "13px" : "12px",
        fontWeight: 400,
      }
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    crosshairs: {
      stroke: {
        color: "#d6d6d6",
      },
    },
  },
  yaxis: [{
    labels: {
      maxWidth: 22,
      offsetX: 9,
      style: {
        colors: "#828287",
        fontSize: (window.innerWidth > 767) ? "13px" : "12px",
        fontWeight: 400,
      },
      formatter: function (val) {
        return Math.round(val)
      }
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },      
  }, 
  {
    show: false, 
    min: 1, 
    max: 1,
    labels: {
      maxWidth: 22,
      offsetX: 9,
      style: {
        colors: "#828287",
        fontSize: (window.innerWidth > 767) ? "13px" : "12px",
        fontWeight: 400,
      },
      formatter: function (val) {
        return Math.round(val)
      }
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  }],
  plotOptions: {
    bar: {
      columnWidth: "0%"
    }
  },
  legend: {
    show: false,
  },
  markers: {
    strokeColors: "#fff",
    hover: {
      size: 4
    }
  },
};

var payment_chart_options = {
  series: [],
  labels: [],
  chart: {
    height: (window.innerWidth > 767) ? 300 : 250, 
    width: "100%",
    type: "area",
    fontFamily: "Proxima Nova",
    zoom: {
      enabled: false
    },
    toolbar: {
      show: false
    },
    animations: {
      enabled: false
    },
    parentHeightOffset: 0,
    redrawOnWindowResize: true,
    redrawOnParentResize: true
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: 3,
    curve: "straight"
  },
  colors: ["#7e5ba8", "#e9e9e9ff"],
  fill: {       
    colors: ["#7e5ba8", "#e9e9e9ff"],       
    type: "gradient",       
    gradient: {         
      shadeIntensity: 1,         
      opacityFrom: 0.5,         
      opacityTo: 0.4,         
      stops: [0, 100],         
      gradientToColors: ["#f6f6f6"],       
    }     
  },
  grid: {
    show: true,
    borderColor: "#ececefab",
    xaxis: {
      lines: {
        show: false
      }
    },   
    yaxis: {
      lines: {
        show: true
      }
    }
  },
  tooltip: {
    enabled: true,
    followCursor: false,
    marker: {
      show: false,
    },
    y: {
      formatter: function (val) {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(".00", "")
      }
    }
  },
  xaxis: {
    opposite: false,
    tickPlacement: "on",
    tooltip: {
      enabled: false,
    },
    labels: {
      hideOverlappingLabels: false,
      rotate: 0,
      maxHeight: 20,
      offsetY: -3,
      style: {
        colors: "#828287",
        fontSize: (window.innerWidth > 767) ? "13px" : "12px",
        fontWeight: 400,
      }
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    crosshairs: {
      stroke: {
        color: "#d6d6d6",
      },
    },
  },
  yaxis: [{
    labels: {
      maxWidth: 22,
      offsetX: 9,
      style: {
        colors: "#828287",
        fontSize: (window.innerWidth > 767) ? "13px" : "12px",
        fontWeight: 400,
      },
      formatter: function (val) {
        return Math.round(val)
      }
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },      
  }, 
  {
    show: false, 
    min: 1, 
    max: 1,
    labels: {
      maxWidth: 22,
      offsetX: 9,
      style: {
        colors: "#828287",
        fontSize: (window.innerWidth > 767) ? "13px" : "12px",
        fontWeight: 400,
      },
      formatter: function (val) {
        return Math.round(val)
      }
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  }],
  plotOptions: {
    bar: {
      columnWidth: "0%"
    }
  },
  legend: {
    show: false,
  },
  markers: {
    strokeColors: "#fff",
    hover: {
      size: 4
    }
  },
};

function float() {
    $(".float input, .float textarea").each(function(e) {
        $(this).wrap("<fieldset></fieldset>");
        var tag = $(this).attr("placeholder");
        $(this).attr("placeholder", "");
        if (!$(this).val() == "") $(this).after('<label for="name" class="stay">' + tag + "</label>");
        else $(this).after('<label for="name">' + tag + "</label>")
    });
    $(".float input, .float textarea").on("blur", function() {
        if (!$(this).val() == "") $(this).next().addClass("stay");
        else $(this).next().removeClass("stay")
    })
}

function validate_num() {
    $(".valid-num").on('input paste', function() {
        if(this.value != this.value.replace(/[^0-9]/g, "")) this.value = this.value.replace(/[^0-9]/g, "");
    });
}

function validate_sum() {
    $(".valid-sum").live("input paste", function() {
      if(this.value != this.value.replace(/[^0-9.]/g, "").replace(/[^.\d]+/g,"").replace( /^([^\.]*\.)|\./g, "$1" ).substring(0, 8)){
        this.value = this.value.replace(/[^0-9.]/g, "").replace(/[^.\d]+/g,"").replace( /^([^\.]*\.)|\./g, "$1" ).substring(0, 8);
      }

      if(this.value.indexOf('.') != -1){
        if((this.value.length-this.value.indexOf('.')) > 3){
          this.value = this.value.substring(0, this.value.indexOf('.') + 3);
        }
      }
    });
}

function validate_wallet() {
    $(".valid-wallet").focus(function() {
        if(this.value.length == 0) this.value = "Z" + this.value;
    });

    $(".valid-wallet").on('input paste', function() {
        this.value = this.value.replace(/[^0-9]/g, "").toUpperCase();
        this.value = 'Z' + this.value;
    });

    $(".valid-wallet").blur(function() {
        if(this.value.length == 1) this.value = "";
    });
}

function validate_phone() {
    $(".valid-phone").focus(function() {
        if(this.value.length == 0) this.value = '+' + this.value;
    });

    $(".valid-phone").on("input paste", function() {
        this.value = this.value.replace(/[^0-9]/g, '').toUpperCase();
        this.value = '+' + this.value;
    });
}

function delete_error() {
    $(".masspay-block .wallet, .masspay-block .amount, .payinp .sum, .ticket-textarea, .form-control, .payout-form input").live("focus", function() {
        $(this).removeClass("error");
    });
}

function highlight_api_key() {
    $(".form-control.token").focus(function() {
        $(this).select();
    });
}

function checkin() {
    $(".checkin input[type=checkbox]").change(function() {
        if (this.checked) {
            $(this).parent().parent().addClass("active");
        } else {
            $(this).parent().parent().removeClass("active");
        }
    });
}

function sticky() {
    if($(window).width() > 1200){
      $(".nav-stacked").sticky({topSpacing: 10}).sticky("update");
      $(".filter-line").sticky({topSpacing: 0, className: "sticky"}).sticky("update");
      $(".payment-filter-line").sticky({topSpacing: 0, className: "sticky"}).sticky("update");
      $(".filter-line").attr("style", "width: "+ $(".filter-line").width() +"px;");
      $(".payment-filter-line").attr("style", "width: "+ $(".head-page-block").width() +"px;");
    }else if($(window).width() > 991){
      $(".nav-stacked").sticky({topSpacing: 95}).sticky("update");
      $(".filter-line, .payment-filter-line").removeAttr("style").unstick();
    }else{
      $(".nav-stacked, .filter-line, .payment-filter-line").removeAttr("style").unstick();
    }
}

function scrolly() {
  if($(window).width() > 1200){
    $(".masspay-list-block, .payout-scroll, .panel-projects .list, .last-trans-scroll, .support-list").niceScroll({cursorcolor:"#131313",cursorwidth:1,cursorborder:"0px solid #fff",horizrailenabled: false}).show();
    $(".masspay-list-block, .payout-scroll, .panel-projects .list, .last-trans-scroll, .support-list").getNiceScroll().resize();
  }else{
    $(".masspay-list-block, .payout-scroll, .panel-projects .list, .last-trans-scroll, .support-list").getNiceScroll().hide();
  }
}

function update_balance() {
    $.ajax({
      url: "/panel/main",
      type: "POST",
      data: {
        balance: $(".user_balance").data("hash")
      },
      cache: !1,
      dataType: "json",
      success: function(c) {
        $(".user_balance b").html(c.balance);
      }
    })
}

function format_amount(amount, update, type, element) {
    var regex = new RegExp("^[0-9.]{0,8}$");    
    if(!regex.test(amount)){
      update = true;
      amount = amount.replace(/[^0-9.]/g, "");
    }

    if(amount.length > 8 && type == "input"){
      update = true;
      amount = amount.substring(0, 8);  
    } 

    if(amount.length > 7 && amount.toString().slice(-1) == "."){
      update = true;
      amount = amount.toString().slice(0,-1);
    } 

    if(amount.substr(0, 1) == "." || (amount.substr(0, 1) == "0" && amount.substr(1, 1) != ".")){
      update = true;
      amount = amount.slice(1);
    }

    if(amount.indexOf('.') != -1){
      if((amount.length-amount.indexOf('.')) > 3){
        update = true;
        amount = amount.substring(0, amount.indexOf('.') + 3);
      }
    }

    if(amount != amount.replace(/[^.\d]+/g,"").replace( /^([^\.]*\.)|\./g, '$1' )){
      update = true;
      amount = amount.replace(/[^.\d]+/g,"").replace( /^([^\.]*\.)|\./g, '$1' )
    }    

    var parts = amount.toString().split(".");
    if(parts[0].length > 3){
      update = true;
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")
      amount = parts.join(".");
    }

    return update ? (type == "input" ? $(element).val(amount) : amount) : false;
}

function update_payout_form() {
    $(".payout-form #payee-currency").removeClass().addClass("left "+$(".payout-form select[name='method'] option:selected").data("payee-currency"));
    $(".payout-form #min-amount").html($("select[name='method'] option:selected").data("min-amount"));
    $(".payout-form #max-amount").html($("select[name='method'] option:selected").data("max-amount"));
    $(".payout-form #commission").html($("select[name='method'] option:selected").data("commission") + "%" + ($(".payout-form select[name='method'] option:selected").val() == "card" ? " + 50 <span class=\"currency\">₽</span>" : ""));
    if($(".payout-form select[name='method'] option:selected").data("rate")){
      $(".payout-form #rate").html("<br>Курс: "+$(".payout-form select[name='method'] option:selected").data("rate"));
    }else{
      $(".payout-form  #rate").html("");
    }
}

function update_payout_amount(type) {
    var value = $(".payout-form input[name='"+ type +"']").val(),
    amount = value.replace(/\s/g, "").replace(/[^.\d]+/g,"").replace( /^([^\.]*\.)|\./g, "$1" ).substring(0, 8);
   
    if(amount.substr(0, 1) == "."){
      amount = amount.slice(1);
    }

    if(amount.slice(-1) == "."){
      amount = amount.slice(0,-1);
    } 

    if(amount.indexOf('.') != -1){
      if((amount.length-amount.indexOf('.')) > 3){
        amount = amount.substring(0, amount.indexOf('.') + 3);
      }
    }    

    var method = $(".payout-form select[name='method'] option:selected").val(),
      rate = parseFloat($(".payout-form select[name='method'] option:selected").data("rate")),
      commission = parseFloat($(".payout-form select[name='method'] option:selected").data("commission")),
      commission_type = $(".payout-form .commission .selected").data("type"),
      commission_amount = (amount/100*commission).toFixed(2);
    if(method == "card") commission_amount = parseFloat(commission_amount) + parseFloat("50");

    var payee_amount = commission_type == "payer" ? amount : (amount-commission_amount);
      button_amount = commission_type == "payer" ? (parseFloat(amount)+parseFloat(commission_amount)) : amount;
    if(rate) payee_amount = (payee_amount/rate).toFixed(2);

    if(!$.isNumeric(amount) || amount < 0.01){
      $(".payout-form input[name='payee_amount']").val("");
      $(".payout-form .btn span").html("");
    }else{
      $(".payout-form .btn span").html(" " + format_amount(button_amount.toString(), true) + " <span class=\"currency\">₽</span>");
      format_amount(payee_amount.toString(), true, "input", ".payout-form input[name='payee_amount']");
    } 

    format_amount(value, false, "input", ".payout-form input[name='amount']");
}

function update_payout_list(count, status) {
    if(count){
      $(".load-payouts").html("Загрузка...").attr("disabled", !0);
    }else{
      $(".payout-table, .no-payouts, .load-payouts").css("opacity", "0.5");
    }
    var hash = $(".payout-form input[name='payout_hash']").val(),
    status = status ? status : $(".payout-list-box select[name='status']").val(),
    from = $(".payout-list-box input[name='from']").val(),
    to = $(".payout-list-box input[name='to']").val(), 
    search = $(".payout-list-box input[name='search']").val();
    count = count ? count : 10;
    setTimeout(function() {
        var total = $.ajax({
            url: "/panel/payout",
            type: "POST",
            data: {
              action: "count",
              status: status,
              from: from,
              to: to,
              search: search,
              list_hash: hash
            },
            global: false,
            async: false,
            success: function(data) {
              return data;
            }
        }).responseText;
        $.ajax({
            url: "/panel/payout",
            type: "POST",
            data: {
                action: "load",
                status: status,
                from: from,
                to: to,
                search: search,                
                count: count,
                list_hash: hash
            },
            cache: !1,
            success: function(a) {
                total < count ? $(".load-payouts").hide() : $(".load-payouts").show();
                total < 1 ? $(".no-payouts").show() : $(".no-payouts").hide();
                $(".payout-scroll").getNiceScroll().show().resize();    
                $(".payout-table tbody").html(a), $(".payout-table, .no-payouts, .load-payouts").css("opacity", "1"), $(".load-payouts").html("Загрузить еще").attr("disabled", !1);
                $("[rel='tooltip']").tooltip();
            },
            error: function() {
                note({
                  content: "Ошибка соединения с сервером",
                  type: "error",
                  time: 5
                });
                $(".payout-table, .no-payouts, .load-payouts").css("opacity", "1"), $(".load-payouts").html("Загрузить еще").attr("disabled", !1);;
            }
        })
    }, 300);
}

function update_chat() {
  if($(window).width() > 1200){
    $(".ticket-history-scroll").removeAttr("style").attr("style", "height: "+ ($(window).height() - $(".ticket-title").height() - $(".ticket-info-box").height() - $(".ticket-send-box").height() - 245) +"px;").scrollTop($(".ticket-history-scroll").prop('scrollHeight'));   
  }else if($(window).width() > 500){
    $(".ticket-history-scroll").removeAttr("style").attr("style", "height: "+ ($(".ticket-chat-box").height() - $(".ticket-title").height() - $(".ticket-info-box").height() - $(".ticket-send-box").height() - 35) +"px;").scrollTop($(".ticket-history-scroll").prop('scrollHeight'));
  }else{
    $(".ticket-chat-box").removeAttr("style").attr("style", "height: "+ ($(window).height() - 60) +"px;");
    $(".ticket-history-scroll").removeAttr("style").attr("style", "height: "+ ($(".ticket-chat-box").height() - $(".ticket-send-box").height() - 30) +"px;").scrollTop($(".ticket-history-scroll").prop('scrollHeight'));
  }
  

  if(!$(".ticket-history-scroll").hasClass("visiable")){
    $(".ticket-history-scroll").fadeIn("fast").addClass("visiable");
  }
  $(".ticket-history-scroll").scrollTop($(".ticket-history-scroll").prop('scrollHeight'));

  if($(window).width() > 767){
    $(".ticket-history-scroll").niceScroll({cursorcolor:"#131313",cursorwidth:1,cursorborder:"0px solid #fff"}).show();
    $(".ticket-history-scroll").getNiceScroll().resize();
  }else{
    $(".ticket-history-scroll").getNiceScroll().hide();
  }
}

function add_phone() {
$(".get-new-phone").on("click", function() {
  $(".phone-box").hide().addClass("number").html('<div class="edit-phone-block"><input type="tel" name="phone" class="form-control valid-phone" autocomplete="off"></div><button type="submit" data-hash="'+ $('.get-new-phone').data('hash') +'" class="btn btn-default sendsms mmw" disabled="disabled">\u041f\u043e\u0434\u0442\u0432\u002e</button>').fadeIn("100");
  confirm_phone();
});
}

function confirm_phone() {
  var input = document.querySelector(".valid-phone");
  var buton = document.querySelector(".sendsms");
  var iti = window.intlTelInput(input, {
    allowDropdown: false,
    nationalMode: false,
    preferredCountries: [ "ru", "ua", "by" ],
    utilsScript: "../../template/js/utils.js"
  });
  var reset = function() {
    input.classList.remove("error");
  };

  var openbut = function() {
    reset();
    if(input.value.trim()){
      if(!iti.isValidNumber()){
        buton.disabled = true;
      }else{
        buton.disabled = false;
      }
    }else{
      buton.disabled = true;
    }
  };

  var validate = function() {
    reset();
    if(input.value.trim()){
      if(!iti.isValidNumber()){
        input.classList.add("error");
      }
    }
  };

  input.addEventListener("blur", validate);
  input.addEventListener("keypress", openbut);
  input.addEventListener("input", openbut);
  input.addEventListener("paste", openbut);
  input.addEventListener("keyup", reset);

  validate_phone();
  delete_error();
  $(".valid-phone").focus().val("").val("+7");

  $(".sendsms").on("click", function() {
    var code = $("input[name='phone']").val(),
        regex = new RegExp("^[0-9+]{12,15}$");

        if (!regex.test(code)) {
          $("input[name='phone']").addClass("error");
        }

        if(!$("input[name='phone']").hasClass("error")){
          $(".sendsms").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
            setTimeout(function() {
              $.ajax({
                type: "POST",
                url: "/panel/cabinet",
                data: {
                  act: "addphone",
                  number: $("input[name='phone']").val(),
                  hash: $(".sendsms").data("hash")
                },
                cache: !1,
                dataType: "json",
                success: function(c) {
                  if(c.error){
                    note({
                        content: c.error,
                        type: 'error',
                        time: 5
                    });
                    $(".sendsms").removeClass("disabled").prop("disabled", false).html("\u041f\u043e\u0434\u0442\u0432\u002e");
                  }else if(c.success){
                    $(".phone-box").hide().removeClass("number").addClass("code").html('<div class="send-code-block"><input type="tel" name="code" class="form-control valid-num" maxlength="6" placeholder="\u041a\u043e\u0434\u0020\u0438\u0437\u0020\u0441\u043c\u0441" autocomplete="off"></div><button type="submit" class="btn btn-default checkcode mmw" disabled="disabled">\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c</button>').fadeIn("100");
                    check_code();
                  }
                },
                error: function() {
                    note({
                        content: "Ошибка соединения с сервером",
                        type: 'error',
                        time: 5
                    });
                    $(".sendsms").removeClass("disabled").prop("disabled", false).html("\u041f\u043e\u0434\u0442\u0432\u002e");
                } 
              })
            }, 300);
        }
   });   
}  

function del_phone() {
  $(".del-phone").one("click", function(event) {
    $.ajax({
     type: "POST",
     url: "/panel/cabinet",
     data: {
      act: "delphone",
      hash: $(".del-phone").data("hash")
     },
     cache: !1,
     dataType: "json",
      success: function(c) {
        if(c.error){
          note({
            content: c.error,
            type: "error",
            time: 5
          });
          del_phone();
        }else if(c.success){
          $(".del-phone-box").hide().removeClass("del-phone-box").addClass("code").addClass("phone-box").html('<div class="send-code-block"><input type="tel" name="code" class="form-control valid-num" maxlength="6" placeholder="\u041a\u043e\u0434\u0020\u0438\u0437\u0020\u0441\u043c\u0441" autocomplete="off"></div><button type="submit" class="btn btn-default checkcode mmw" disabled="disabled">\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c</button>').fadeIn("100");
          check_code();
        }
      },
      error: function() {
        note({
          content: "Ошибка соединения с сервером",
          type: "error",
          time: 5
        });
        del_phone();
      } 
    })
  });   
} 

function check_code() {
  validate_num();
  delete_error();
  $(".valid-num").focus();

  $("input[name='code']").on("input paste", function() {
    if(this.value.length != 6){
      $(".checkcode").attr("disabled", "disabled");
    }else{
     $(".checkcode").removeAttr("disabled");
    }
  });

  $("input[name='code']").blur(function() {
    if(this.value.length > 0 && this.value.length != 6){
      $(this).addClass("error");
    }
  });

  $(".checkcode").on("click", function() {
    var code = $("input[name='code']").val(),
        regex = new RegExp("^[0-9]{6}$");

        if (!regex.test(code)) {
          $("input[name='code']").addClass("error");
        }

        if(!$("input[name='code']").hasClass("error")){
          $(".checkcode").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
            setTimeout(function() {
              $.ajax({
                type: "POST",
                url: "/panel/cabinet",
                data: {
                  code: code
                },
                cache: !1,
                dataType: "json",
                success: function(c) {
                  if(c.error){
                    note({
                        content: c.error,
                        type: "error",
                        time: 5
                    });
                    if(c.code == '0'){
                      if(c.act == 'addphone'){
                        $(".phone-box").hide().removeClass("code").removeClass("number").html('<a data-hash="'+ c.hash +'" class="get-new-phone">\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c\u0020\u043d\u043e\u0432\u044b\u0439</a>').fadeIn("100");
                        add_phone();
                      }else if(c.act == 'delphone'){
                        $(".phone-box").hide().removeClass("code").removeClass("phone-box").addClass("del-phone-box").html('<p class="form-control-static">'+ c.phone +'</p> <a data-hash="'+ c.hash +'" class="del-phone">\u0423\u0434\u0430\u043b\u0438\u0442\u044c</a').fadeIn("100");
                        del_phone();
                      }
                    }else if(c.code == '1'){
                      $(".valid-num").val("").focus();
                    }
                    $(".checkcode").html("\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c");
                  }else if(c.success){
                    note({
                        content: '\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438\u0020\u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u044b',
                        type: 'success',
                        time: 5
                    });
                    if(c.act == 'addphone'){
                      $(".phone-box").hide().removeClass("code").removeClass("phone-box").addClass("del-phone-box").html('<p class="form-control-static">'+ c.success +'</p> <a data-hash="'+ c.hash +'" class="del-phone"></a>').fadeIn("100");
                      del_phone();
                    }else if(c.act == 'delphone'){
                      $(".phone-box").hide().removeClass("code").removeClass("number").html('<a data-hash="'+ c.hash +'" class="get-new-phone">\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c\u0020\u043d\u043e\u0432\u044b\u0439</a>').fadeIn("100");
                      add_phone();
                    }                    
                  }
                },
                error: function() {
                    note({
                        content: "Ошибка соединения с сервером",
                        type: 'error',
                        time: 5
                    });
                    $(".checkcode").removeClass("disabled").prop("disabled", false).html("\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c");
                } 
              })
            }, 300);
        }
   }); 

}

function card_type() {
    $("#card-type").change(function(e) {
        var ct = $(this).val();
        ct == '0' ? $(".card-type").html("Банковские карты эмитированные в РФ") 
        : $(".card-type").html("Банковские карты эмитированные в Украине");
    });
}

function valid_form(id) {
    let hasErrors = false;
    $("#"+ id +" input").each(function(){
        if ($(this).val().trim() == "") {
          hasErrors = true;
          $(this).addClass("error");    
        }
    });      
    return hasErrors ? false : true;
}

function get_form(f, valid) {
    if(!valid || valid_form(valid)){
    $("#form .btn").addClass("disabled").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
    setTimeout(function() {
        $.ajax({
            type: "POST",
            url: f,
            data: $("#form").serialize(),
            success: function(c) {
                $(".panel-content").html(c);
                $("#date").mask("99.99.9999");
                $("[rel='tooltip']").tooltip();
                $("select:not(.mobile-pills)").styler();
                validate_wallet();
                validate_num();
                delete_error();
                highlight_api_key();
                checkin();
                add_phone();
                del_phone();
                sticky();
                card_type();
                $(".nav-stacked").sticky("update");
                $("#form .btn").removeClass("disabled").prop("disabled", false).html("Сохранить");
                note({
                    content: $("#note").val(),
                    type: $("#note").data("type"),
                    time: 5
                });
            },
            error: function() {
                $("#form .btn").removeClass("disabled").prop("disabled", false).html("Сохранить");
            }
        })
    }, 300)
}

    return false;
}

function get_form1(f, valid) {
    if(!valid || valid_form(valid)){
    $("#form1 .btn").addClass("disabled").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
    setTimeout(function() {
        $.ajax({
            type: "POST",
            url: f,
            data: $("#form1").serialize(),
            success: function(c) {
                $(".panel-content").html(c);
                $("#date").mask("99.99.9999");
                $("[rel='tooltip']").tooltip();
                $("select:not(.mobile-pills)").styler();
                validate_wallet();
                validate_num();
                delete_error();
                checkin();
                add_phone();
                del_phone();
                sticky();
                card_type();
                $(".nav-stacked").sticky("update");
                $("#form1 .btn").removeClass("disabled").prop("disabled", false).html("Сохранить");
                note({
                    content: $("#note").val(),
                    type: $("#note").data("type"),
                    time: 5
                });
            },
            error: function() {
                $("#form1 .btn").removeClass("disabled").prop("disabled", false).html("Сохранить");
            }
        })
    }, 300)
}

    return false;
}

function get_form2(f, valid) {
    if(!valid || valid_form(valid)){
    $("#form2 .btn").addClass("disabled").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
    setTimeout(function() {
        $.ajax({
            type: "POST",
            url: f,
            data: $("#form2").serialize(),
            success: function(c) {
                $(".panel-content").html(c);
                $("#date").mask("99.99.9999");
                $("[rel='tooltip']").tooltip();
                $("select:not(.mobile-pills)").styler();
                validate_wallet();
                validate_num();
                delete_error();
                checkin();
                card_type();
                $(".nav-stacked").sticky("update");
                $("#form2 .btn").removeClass("disabled").prop("disabled", false).html("Сохранить");
                note({
                    content: $("#note").val(),
                    type: $("#note").data("type"),
                    time: 5
                });
            },
            error: function() {
                $("#form2 .btn").removeClass("disabled").prop("disabled", false).html("Сохранить");
            }
        })
    }, 300)
}

    return false;
}

function get_key(url) {
    $.ajax({
        type: "POST",
        url: url,
        data: $("#form_key").serialize(),
        success: function(msg) {
            $(".panel-content").html(msg);
            $("[rel='tooltip']").tooltip();
            highlight_api_key();
        }
    });
    return false;
}

function update_payment_list(project, count) {
  if(count){
    $(".load-payments").html("Загрузка...").attr("disabled", !0);
  }else{
    $(".apexcharts-canvas, .payment-table, .no-payments, .load-payments").css("opacity", "0.5");
  }
  var hash = $(".payment-filter input[name=hash]").val(),
      status = $(".payment-filter select[name=status]").val(),
      method = $(".payment-filter select[name=method]").val(),
      from = $(".payment-filter input[name=from]").val(),
      to = $(".payment-filter input[name=to]").val(),
      search = $(".payment-filter input[name=search]").val(),
      count = count ? count : 25;
  setTimeout(function() {
    var total = JSON.parse($.ajax({
          url: "/panel/project/"+ project,
          type: "POST",
          data: {
            act: "stat",
            action: "count",
            status: status,
            method: method,
            from: from,
            to: to,
            search: search,
            hash: hash
          },
          global: false,
          async: false,
          success: function(data) {
            return data;
          }
    }).responseText);
    var chart = JSON.parse($.ajax({
          url: "/panel/project/"+ project,
          type: "POST",
          data: {
            act: "stat",
            action: "chart",
            status: status,
            method: method,
            from: from,
            to: to,
            search: search,
            hash: hash
          },
          global: false,
          async: false,
          success: function(data) {
            return data;
          }
    }).responseText);
    $.ajax({
      url: "/panel/project/"+ project,
      type: "POST",
      data: {
        act: "stat",
        action: "load",
        status: status,
        method: method,
        from: from,
        to: to,
        search: search,
        count: count,
        hash: hash
      },
      cache: false,
      success: function(a) {
        $(".payment-info-box .count").html(total.count);
        $(".payment-info-box .sum").html(total.sum);
        total.count < count ? $(".load-payments").hide() : $(".load-payments").show();
        total.count < 1 ? $(".no-payments").show() : $(".no-payments").hide();   
        $(".payment-table tbody").html(a), $(".apexcharts-canvas, .payment-table, .no-payments, .load-payments").css("opacity", "1"), $(".load-payments").html("Загрузить еще").attr("disabled", !1);
        $("[rel=tooltip]").tooltip();
        if(chart){  
          payment_chart.updateOptions({
            series: [{type: "area", data: JSON.parse(chart.sum)}, {type: "column", data: JSON.parse(chart.count)}],
            labels: JSON.parse(chart.time)
          });
        };
        $("footer style").html("#payment-chart .apexcharts-xaxis-label:nth-child("+ chart.gap +"n+1) {display: revert;}");
      },
      error: function() {
          note({
            content: "Ошибка соединения с сервером",
            type: "error",
            time: 5
          });
        $(".apexcharts-canvas, .payment-table, .no-payments, .load-payments").css("opacity", "1"), $(".load-payments").html("Загрузить еще").attr("disabled", !1);;
      }
    })
  }, 300);
}

function update_form(project, sign) {
    $("#code-form").hide();
    $("#form-sum, #form-function").removeClass("error");
    var a = $("#form-function").val(),
        b = $("#form-func-type").val(),
        r = $("#form-theme").val(),
        hd = "<div class='preview-form-header'></div>";
    r == "0" ? $("#preview-form").removeClass("dark") : $("#preview-form").addClass("dark");
    var k = $("#form-button-text").val(),
        h = $("#form-sum").val(),
        g = $("#form-sum-type").val();
        w = $("#form-currency").val();
    var q = "0" == g ? "<div class='form-footer'><div class='form-amount'>\u0421\u0443\u043c\u043c\u0430 <span>" + h.replace(/[^0-9]/g, '').replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 ") + " " + w + "</span></div>" : "<div class='form-footer'><div class='form-amount none float'><input type='number' class='form-control' placeholder='\u0421\u0443\u043c\u043c\u0430'></div>";
    if ("checked" == $("#form-fio").attr("checked")) {
        var n =
            "<div class='form-area float'><input type='text' class='form-control' placeholder='\u0424\u0418\u041e'/></div>";
        var d = "1"
    } else n = " ", d = "0";
    if ("checked" == $("#form-phone").attr("checked")) {
        var p = "<div class='form-area float'><input type='text' class='form-control' placeholder='\u041d\u043e\u043c\u0435\u0440\u0020\u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430'/></div>";
        var e = "1"
    } else p = " ", e = "0";
    if ("checked" == $("#form-address").attr("checked")) {
        var l = "<div class='form-area float'><input type='text' class='form-control' placeholder='\u0410\u0434\u0440\u0435\u0441\u0020\u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0438'/></div>";
        var f = "1"
    } else l = " ", f = "0";
    if(d == "0" && e == "0" && f == "0"){
      var c = "0" == b ? "<div class='form-desc'>" + a + "</div>" : "<div class='form-desc-none float'><input type='text' class='form-control' placeholder='\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435\u0020\u043f\u043b\u0430\u0442\u0435\u0436\u0430'></div>";
    }else{
      var c = "0" == b ? "<div class='form-desc'>" + a + "</div>" : "<div class='form-desc-none-f float'><input type='text' class='form-control' placeholder='\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435\u0020\u043f\u043b\u0430\u0442\u0435\u0436\u0430'></div>";
    }
    var height = 230;
    if(b == '1') height = +height+9;
    if(g == '1') height = +height+18;
    if(d == '1') height = +height+60;
    if(e == '1') height = +height+60;
    if(f == '1') height = +height+60;
    var m = "width='400' height='"+ height +"'";
    l = "" + hd + " " + n + " " + p + " " + l + " " + c + "  " + q + "<button class='f-but'>" + k + "</button></div>";
    m = "<iframe src='https://anypay.io/widget/form?merchant_id=" + project + "&pay_id=1&amount=" + h + "&currency=" + w + "&desc=" + encodeURIComponent(a) + "&text=" + encodeURIComponent(k) + "&theme=" + r + "&desc_type=" + b + "&amount_type=" + g + "&fio=" + d + "&phone=" + e + "&address=" + f + "&sign=" + sign + "' " + m + " scrolling='no' frameBorder='0' noresize></iframe>";
    $("#preview-form").html(l);
    $("#code-form").val(m)
    float();
}

function create_form(project) {
    if($("#form-sum").val().length < 1 && $("#form-sum-type").val() == 0){
       $("#form-sum").addClass("error");
       var ers = 1;
    }else{
       $("#form-sum").removeClass("error");
       var ers = 0;
    }

    if($("#form-function").val().length < 1 && $("#form-func-type").val() == 0){
       $("#form-function").addClass("error");
       var ert = 1;
    }else{
       $("#form-function").removeClass("error");
       var ert = 0;
    }

    if(!ers && !ert){
      $("#code-form").hide();
      $(".widget-form .btn").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
      setTimeout(function() {
        $.ajax({
          type: "POST",
          url: "/panel/project/"+ project,
          data: {
            act: "widgets",
            type: "form",
            pay_id: "1",
            desc: $("#form-function").val(),
            amount: $("#form-sum").val(),
            amount_type: $("#form-sum-type").val(),
            currency: $("#form-currency").val(),
            hash: $(".create-form").data("hash")
          },
          cache: !1,
          dataType: "json",
          success: function(c) {
            update_form(project, c.sign);
            $("#code-form").show();
            $(".widget-form .btn").prop("disabled", false).html("\u0421\u043e\u0437\u0434\u0430\u0442\u044c\u0020\u0444\u043e\u0440\u043c\u0443");
          },
          error: function() {
            note({
              content: "Ошибка соединения с сервером",
              type: "error",
              time: 5
            });
            $(".widget-form .btn").prop("disabled", false).html("\u0421\u043e\u0437\u0434\u0430\u0442\u044c\u0020\u0444\u043e\u0440\u043c\u0443");
          } 
        })    
      }, 500)        
    }
}

function update_button(project, sign) {
    $("#code").hide();
    $("#button-sum, #button-function").removeClass("error");
    var c = $("#button-text").val(),
        a = $("#button-size").val(),
        d = $("#button-sum").val(),
        v = $("#button-currency").val(),
        e = $("#button-function").val(),
        r = $("#button-theme").val(),
    h = "<div class='button-block " + a + "'><span class='button-left'>" + d.replace(/[^0-9]/g, '').replace(/(\d{1,3})(?=((\d{3})*([^\d]|$)))/g, " $1 ") + " " + v + "</span><a class='button-right'>" + c + "</span></a>";
    r == "0" ? $("#preview").removeClass("dark") : $("#preview").addClass("dark");
    var b = "small" == a ? "width='240' height='45'" : "middle" == a ? "width='270' height='55'" : "width='320' height='63'";
    b = "<iframe src='https://anypay.io/widget/button?merchant_id=" + project + "&pay_id=1&amount=" + d + "&currency=" + v + "&desc=" +
        encodeURIComponent(e) + "&text=" + encodeURIComponent(c) + "&size=" + a + "&theme=" + r + "&sign=" + sign + "'  " + b + " scrolling='no' frameBorder='0' noresize></iframe>";
    $("#preview").html(h);
    $("#code").val(b);
};

function create_button(project) {
    if($("#button-sum").val().length < 1){
       $("#button-sum").addClass("error");
       var ers = 1;
    }else{
       $("#button-smm").removeClass("error");
       var ers = 0;
    }

    if($("#button-function").val().length < 1){
       $("#button-function").addClass("error");
       var erf = 1;
    }else{
       $("#button-function").removeClass("error");
       var erf = 0;
    }

    if(!ers && !erf){
      $("#code").hide();
      $(".button-form .btn").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
      setTimeout(function() {
        $.ajax({
          type: "POST",
          url: "/panel/project/"+ project,
          data: {
            act: "widgets",
            type: "button",
            pay_id: "1",
            desc: $("#button-function").val(),
            amount: $("#button-sum").val(),
            currency: $("#button-currency").val(),
            hash: $(".create-button").data("hash")
          },
          cache: !1,
          dataType: "json",
          success: function(c) {
            update_button(project, c.sign);
            $("#code").show();
            $(".button-form .btn").prop("disabled", false).html("\u0421\u043e\u0437\u0434\u0430\u0442\u044c\u0020\u043a\u043d\u043e\u043f\u043a\u0443");
          },
          error: function() {
            note({
              content: "Ошибка соединения с сервером",
              type: "error",
              time: 5
            });
            $(".button-form .btn").prop("disabled", false).html("\u0421\u043e\u0437\u0434\u0430\u0442\u044c\u0020\u043a\u043d\u043e\u043f\u043a\u0443");
          } 
        })    
      }, 500) 
    }
}

function update_qrcode(project, sign) {
    $("#code-qr").hide();
    $("#qr-code-sum, #qr-code-function").removeClass("error");
    var c = $("#qr-code-num").val(),
        a = $("#qr-code-size").val(),
        d = $("#qr-code-sum").val(),
        v = $("#qr-code-currency").val(),
        e = $("#qr-code-function").val(),
        r = $("#qr-code-theme").val();
        b = "small" == a ? "width='200' height='200'" : "middle" == a ? "width='250' height='250'" : "width='300' height='300'",
        h = "<img "+ b +" class='qr-block' src='https://anypay.io/widget/qr?merchant_id=null&amount=null&pay_id=null&desc=null&currency=RUB&theme="+ r +"&sign=null'>";
        z = "<img "+ b +" style='border-radius: 5px; box-shadow: 0 10px 32px rgba(109, 109, 109, 0.16);' src='https://anypay.io/widget/qr?merchant_id="+ project +"&amount="+ d +"&pay_id="+ c +"&desc="+ e +"&currency="+ v +"&theme="+ r +"&sign="+ sign +"'>";
    $("#preview-qr").html(h);
    $("#code-qr").val(z);
};

function create_qrcode(project) {
    if($("#qr-code-num").val().length < 1){
      $("#qr-code-num").addClass("error");
      var ern = 1;
    }else{
      $("#qr-code-num").removeClass("error");
      var ern = 0;
    }

    if($("#qr-code-sum").val().length < 1){
      $("#qr-code-sum").addClass("error");
      var ers = 1;
    }else{
      $("#qr-code-sum").removeClass("error");
      var ers = 0;
    }

    if($("#qr-code-function").val().length < 1){
      $("#qr-code-function").addClass("error");
      var erf= 1;
    }else{
      $("#qr-code-function").removeClass("error");
      var erf = 0;
    }

    if(!ern && !ers && !erf){
      $("#code-qr").hide();
      $(".qr-code-form .btn").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
      setTimeout(function() {
        $.ajax({
          type: "POST",
          url: "/panel/project/"+ project,
          data: {
            act: "widgets",
            type: "qr-code",
            pay_id: $("#qr-code-num").val(),
            desc: $("#qr-code-function").val(),
            amount: $("#qr-code-sum").val(),
            currency: $("#qr-code-currency").val(),
            hash: $(".create-qr-code").data("hash")
          },
          cache: !1,
          dataType: "json",
          success: function(c) {
            update_qrcode(project, c.sign);
            $("#code-qr").show();
            $(".qr-code-form .btn").prop("disabled", false).html("\u0421\u043e\u0437\u0434\u0430\u0442\u044c\u0020\u0051\u0052\u0020\u043a\u043e\u0434");
          },
          error: function() {
            note({
              content: "Ошибка соединения с сервером",
              type: "error",
              time: 5
            });
            $(".qr-code-form .btn").prop("disabled", false).html("\u0421\u043e\u0437\u0434\u0430\u0442\u044c\u0020\u0051\u0052\u0020\u043a\u043e\u0434");
          } 
        })    
      }, 500)
    }
}

function update_link(project, sign) {
    $("#code-link").hide();
    $("#link-sum, #link-function, #link-num").removeClass("error");
    var a = $("#link-num").val(),
        b = $("#link-function").val(),
        c = $("#link-sum").val(),
        w = $("#link-currency").val(),
    a = "https://anypay.io/merchant?merchant_id=" + project + "&pay_id=" + a + "&amount=" + c + "&currency=" + w + "&desc=" + encodeURIComponent(b) + "&sign=" + sign + "";
    $("#code-link").val(a)
}

function create_link(project) {
    if($("#link-sum").val().length < 1){
       $("#link-sum").addClass("error");
       var ers = 1;
    }else{
       $("#link-sum").removeClass("error");
       var ers = 0;
    }

    if($("#link-function").val().length < 1){
       $("#link-function").addClass("error");
       var erf = 1;
    }else{
       $("#link-function").removeClass("error");
       var erf = 0;
    }

    if($("#link-num").val().length < 1){
       $("#link-num").addClass("error");
       var ern = 1;
    }else{
       $("#link-num").removeClass("error");
       var ern = 0;
    }

    if(!ers && !erf && !ern){
      $("#code-link").hide();
      $(".link-form .btn").prop("disabled", true).html("<div class=\"preloader-wrapper small active addload\"><div class=\"spinner-layer spinner-green-only\"><div class=\"circle-clipper left\"><div class=\"circle\"></div></div><div class=\"gap-patch\"><div class=\"circle\"></div></div><div class=\"circle-clipper right\"><div class=\"circle\"></div></div></div></div>");
      setTimeout(function() {
        $.ajax({
          type: "POST",
          url: "/panel/project/"+ project,
          data: {
            act: "widgets",
            type: "link",
            pay_id: $("#link-num").val(),
            desc: $("#link-function").val(),
            amount: $("#link-sum").val(),
            currency: $("#link-currency").val(),
            hash: $(".create-link").data("hash")
          },
          cache: !1,
          dataType: "json",
          success: function(c) {
            update_link(project, c.sign);
            $("#code-link").show();
            $(".link-form .btn").prop("disabled", false).html("\u0421\u0433\u0435\u043d\u0435\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c\u0020\u0441\u0441\u044b\u043b\u043a\u0443");
          },
          error: function() {
            note({
              content: "Ошибка соединения с сервером",
              type: "error",
              time: 5
            });
            $(".link-form .btn").prop("disabled", false).html("\u0421\u0433\u0435\u043d\u0435\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c\u0020\u0441\u0441\u044b\u043b\u043a\u0443");
          } 
        })    
      }, 500) 
    }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function gen_pass() {
    var length = getRandomInt(18, 33),
        charset = "abcdefghijLMNOPQRSTUVWXYZ0klmnopqrstuvwxyzABCDEFGHIJK123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) retVal += charset.charAt(Math.floor(Math.random() * n));
    $("#sec-pass").html('<input type="text" name="secret_key" value="' + retVal + '" class="form-control" autocomplete="off">')
}