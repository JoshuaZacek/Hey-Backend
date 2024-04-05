export default function is_valid_email(email: string): boolean {
  /*  
    =====================================
    BREAKING DOWN EMAIL REGULAR EXPRESSION 
    ======================================
      
    ^ = BEGINNING OF STRING
    [^\s@]+ = ANY CHARACTER EXCEPT WHITE-SPACE OR @ ONCE OR MORE
    @ = @ LITERALLY
    [^\s@\.]+ = ANY CHARACTER EXCEPT WHITE-SPACE, @, OR . ONCE OR MORE
    \. = . LITERALLY
    [^\s@\.][^\s@]* = ANY CHARACTER EXCEPT WHITE-SPACE OR @ ONCE OR MORE, FRONT CHARATCER CANNOT BE .
  */
  return /^[^\s@]+@[^\s@\.]+\.[^\s@\.][^\s@]*$/.test(email);
}
