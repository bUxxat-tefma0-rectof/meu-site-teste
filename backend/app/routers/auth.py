    new_user = User(
        full_name=user_data.full_name,
        username=user_data.username,
        email=user_data.email,
        country_code=user_data.country_code,
        phone=user_data.phone,
        how_found_us=user_data.how_found_us,
        terms_accepted=user_data.terms_accepted,
        hashed_password=hash_password(user_data.password),
        is_verified=False,
    )
