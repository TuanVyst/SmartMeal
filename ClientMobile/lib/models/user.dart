/// User model – mapped from web's auth response (AuthContext.jsx)
class User {
  final String? accountId;
  final String? username;
  final String? email;
  final String? name;
  final String? phone;
  final String? avatar;
  final String? role;
  final String? token;
  final String? address;

  User({
    this.accountId,
    this.username,
    this.email,
    this.name,
    this.phone,
    this.avatar,
    this.role,
    this.token,
    this.address,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      accountId: json['accountId']?.toString() ?? json['account_id']?.toString(),
      username: json['username'] as String?,
      email: json['email'] as String?,
      name: json['name'] as String?,
      phone: json['phone'] as String?,
      avatar: json['avatar'] as String?,
      role: json['role'] as String?,
      token: json['token'] as String?,
      address: json['address'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accountId': accountId,
      'username': username,
      'email': email,
      'name': name,
      'phone': phone,
      'avatar': avatar,
      'role': role,
      'token': token,
      'address': address,
    };
  }

  bool get isAdmin => role == 'Admin';

  String get displayName => username ?? name ?? 'Bạn';

  String get initials => displayName.isNotEmpty ? displayName[0].toUpperCase() : '?';

  User copyWith({
    String? accountId,
    String? username,
    String? email,
    String? name,
    String? phone,
    String? avatar,
    String? role,
    String? token,
    String? address,
  }) {
    return User(
      accountId: accountId ?? this.accountId,
      username: username ?? this.username,
      email: email ?? this.email,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      role: role ?? this.role,
      token: token ?? this.token,
      address: address ?? this.address,
    );
  }
}
